import { createStore, extractSnippet, type QMDStore } from "@tobilu/qmd";
import fs from "node:fs";
import path from "node:path";
import type { LoadedBundle } from "../bundle.js";
import type { NarrativeHit, NarrativeQuery } from "./narrativeRetrieval.js";
import { NarrativeRetrieval } from "./narrativeRetrieval.js";

let storeCache: { dbPath: string; store: QMDStore } | null = null;

/**
 * Release cached QMD DB (e.g. after tests or switching ORDERLY_AI_DOCS_REPO_ROOT).
 */
export function clearQmdStoreCache(): void {
  void storeCache?.store.close().catch(() => {});
  storeCache = null;
}

function resolveQmdDbPath(bundle: LoadedBundle): string {
  const qmdMeta = bundle.manifest.qmd;
  const indexRel =
    qmdMeta && typeof qmdMeta.indexPath === "string"
      ? qmdMeta.indexPath
      : "qmd/index.sqlite";
  return path.join(bundle.generatedRoot, indexRel);
}

async function getStore(bundle: LoadedBundle): Promise<QMDStore | null> {
  const dbPath = resolveQmdDbPath(bundle);
  if (!fs.existsSync(dbPath)) return null;
  if (storeCache?.dbPath === dbPath) return storeCache.store;
  if (storeCache) {
    await storeCache.store.close().catch(() => {});
    storeCache = null;
  }
  const store = await createStore({ dbPath });
  storeCache = { dbPath, store };
  return store;
}

function hitToNarrativeHit(
  row: {
    docid: string;
    filepath: string;
    displayPath: string;
    title: string;
    body?: string;
    score: number;
  },
  query: string,
): NarrativeHit {
  const text =
    row.body && row.body.length > 0
      ? extractSnippet(row.body, query, 800).snippet
      : row.title;
  return {
    id: row.docid,
    path: row.displayPath || row.filepath,
    heading: row.title,
    text,
    score: row.score,
  };
}

/** Row shape shared by {@link QMDStore.searchLex} and {@link QMDStore.searchVector}. */
type QmdHitRow = {
  docid: string;
  filepath: string;
  displayPath: string;
  title: string;
  body?: string;
  score: number;
};

/**
 * Dedupe by docid and keep the strongest score (BM25 vs vector use comparable 0–1-ish scales in QMD).
 */
function mergeByDocid(rows: QmdHitRow[]): QmdHitRow[] {
  const best = new Map<string, QmdHitRow>();
  for (const r of rows) {
    const cur = best.get(r.docid);
    if (!cur || r.score > cur.score) best.set(r.docid, r);
  }
  return [...best.values()].sort((a, b) => b.score - a.score);
}

/**
 * Whitespace tokens that still contain a letter or digit after QMD-style stripping.
 * Used to approximate OR-style recall: QMD's lex layer ANDs all terms, which often returns zero rows.
 */
function significantTokens(query: string): string[] {
  return query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 0 && /[\p{L}\p{N}]/u.test(t));
}

/**
 * When `packages` is set, keep hits whose path matches any listed package id (e.g. `trading` or `orderly.network/ui`).
 */
function filterByPackages(
  rows: QmdHitRow[],
  packages: string[] | undefined,
): QmdHitRow[] {
  if (!packages?.length) return rows;
  const needles = packages.map((p) =>
    p
      .toLowerCase()
      .replace(/^@orderly\.network\//, "")
      .replace(/^@/, ""),
  );
  return rows.filter((r) => {
    const path = (r.displayPath || r.filepath).toLowerCase();
    return needles.some((n) => n.length > 0 && path.includes(n));
  });
}

/**
 * QMD-backed narrative search: BM25 + optional vector similarity, with per-token BM25 fallback.
 *
 * Rationale: {@link QMDStore.searchLex} builds an FTS5 query that ANDs terms; multi-word English
 * queries often miss. Merging {@link QMDStore.searchVector} helps when `qmd:index` + `embed` ran;
 * token-wise BM25 improves recall without loading embedding models when vectors are absent.
 */
export class QmdNarrativeRetrieval implements NarrativeRetrieval {
  constructor(private bundle: LoadedBundle) {}

  async search(q: NarrativeQuery): Promise<NarrativeHit[]> {
    const store = await getStore(this.bundle);
    if (!store) return [];

    const k = q.k;
    /** Pull extra candidates before filtering so `packages` / merging still yield `k` hits. */
    const fetchLimit = Math.min(120, Math.max(k * 3, 24));

    let rows: QmdHitRow[] = [];

    try {
      const [lexRows, vecRows] = await Promise.all([
        store
          .searchLex(q.query, { limit: fetchLimit })
          .catch(() => [] as QmdHitRow[]),
        store
          .searchVector(q.query, { limit: fetchLimit })
          .catch(() => [] as QmdHitRow[]),
      ]);
      rows = mergeByDocid([
        ...(lexRows as QmdHitRow[]),
        ...(vecRows as QmdHitRow[]),
      ]);

      // Per-token BM25: OR-like recall vs QMD's default AND of all terms.
      if (rows.length < k) {
        const tokens = significantTokens(q.query);
        if (tokens.length > 1) {
          for (const tok of tokens) {
            if (rows.length >= fetchLimit) break;
            const part = await store
              .searchLex(tok, { limit: fetchLimit })
              .catch(() => [] as QmdHitRow[]);
            rows = mergeByDocid([...rows, ...(part as QmdHitRow[])]);
          }
        }
      }

      rows = filterByPackages(rows, q.packages).slice(0, k);
      return rows.map((r) => hitToNarrativeHit(r, q.query));
    } catch {
      return [];
    }
  }
}
