import type { LoadedBundle } from "./bundle.js";
import { errResult, okResult } from "./envelope.js";
import type { NarrativeRetrieval } from "./narrative/narrativeRetrieval.js";
import type { Citation, DocsResult, NarrativeHit } from "./types.js";

export type SearchDocsInput = {
  query: string;
  k?: number;
  kinds?: string[];
  packages?: string[];
};

export type SearchDocsData = {
  narrativeHits: NarrativeHit[];
  /** Set when the query equals a known id-index key (agent can call getComponent/getType next). */
  matchedEntityId?: string;
  /** When the first whitespace-delimited token maps to exactly one keyword-index entry. */
  keywordSingletonId?: string;
};

function looksLikeEntityId(q: string): boolean {
  return /^[a-z][a-z0-9_]*\.[A-Za-z0-9_.]+$/.test(q);
}

/**
 * Narrative search via QMD only; optional id/keyword hints from in-memory JSON indexes first.
 */
export async function searchDocs(
  bundle: LoadedBundle,
  qmdNarrative: NarrativeRetrieval,
  input: SearchDocsInput,
  started: number,
): Promise<DocsResult<SearchDocsData>> {
  const query = input.query.trim();
  if (!query) {
    return errResult(
      "INVALID_INPUT",
      "search query must be non-empty.",
      undefined,
      bundle,
    ) as DocsResult<SearchDocsData>;
  }

  const k = Math.min(50, Math.max(1, input.k ?? 8));
  const baseQ = { query, k, kinds: input.kinds, packages: input.packages };

  let matchedEntityId: string | undefined;
  if (looksLikeEntityId(query) && bundle.idIndex[query]) {
    matchedEntityId = query;
  }

  let keywordSingletonId: string | undefined;
  const firstTok = query.toLowerCase().split(/\s+/)[0] ?? "";
  if (firstTok.length > 1) {
    const ids = bundle.keywordIndex[firstTok];
    if (ids?.length === 1) {
      keywordSingletonId = ids[0];
    }
  }

  const narrativeHits = await qmdNarrative.search(baseQ);

  const citations: Citation[] = narrativeHits.slice(0, 5).map((h) => ({
    path: h.path,
    id: h.id,
    why: "narrative-hit",
    ...(h.heading ? {} : {}),
  }));

  return okResult(
    bundle,
    {
      narrativeHits,
      ...(matchedEntityId !== undefined ? { matchedEntityId } : {}),
      ...(keywordSingletonId !== undefined ? { keywordSingletonId } : {}),
    },
    "narrative",
    citations,
    started,
  );
}
