/**
 * Build QMD SQLite index via @tobilu/qmd (programmatic). Run after `generate`.
 */
import { createStore } from "@tobilu/qmd";
import fg from "fast-glob";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  AI_DOCS_ROOT,
  GENERATED_ROOT,
  PACKAGES_ROOT,
  REPO_ROOT,
  relFromRepo,
} from "./internal/paths.js";

/** QMD collection for workflows, recipes, and agent docs under `apps/ai-docs`. */
const COLLECTION_AI_DOCS = "orderly-ai-docs";
/** QMD collection for markdown spread across workspace packages (README, doc/, CHANGELOG, etc.). */
const COLLECTION_PACKAGES = "orderly-packages";
const DOC_META_INDEX_REL = "qmd/doc-meta-index.json";

type DocMeta = {
  kind?: string;
  domain?: string;
  docType?: string;
  package?: string;
  intentTags?: string[];
  lang?: string;
};

function addMetaKey(rows: Record<string, DocMeta>, key: string, meta: DocMeta) {
  if (!key) return;
  rows[key] = meta;
  const lower = key.toLowerCase();
  rows[lower] = meta;
  rows[lower.replace(/_/g, "-")] = meta;
}

function parseFrontmatter(raw: string): DocMeta {
  if (!raw.startsWith("---\n")) return {};
  const end = raw.indexOf("\n---\n", 4);
  if (end <= 4) return {};
  const block = raw.slice(4, end);
  const meta: DocMeta = {};
  for (const line of block.split("\n")) {
    const idx = line.indexOf(":");
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!value) continue;
    if (key === "kind") meta.kind = value;
    if (key === "domain") meta.domain = value;
    if (key === "docType") meta.docType = value;
    if (key === "package") meta.package = value.replace(/^["']|["']$/g, "");
    if (key === "lang") meta.lang = value.toLowerCase();
    if (key === "intentTags") {
      meta.intentTags = value
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((x) =>
          x
            .trim()
            .replace(/^["']|["']$/g, "")
            .toLowerCase(),
        )
        .filter(Boolean);
    }
  }
  return meta;
}

async function buildDocMetaIndex(): Promise<Record<string, DocMeta>> {
  const rows: Record<string, DocMeta> = {};
  const files = await fg(["**/*.md"], {
    cwd: REPO_ROOT,
    onlyFiles: true,
    ignore: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.turbo/**",
      "apps/ai-docs/generated/**",
    ],
  });

  for (const rel of files) {
    // Keep scope aligned with QMD collections.
    if (!rel.startsWith("apps/ai-docs/") && !rel.startsWith("packages/"))
      continue;
    const abs = path.join(REPO_ROOT, rel);
    let raw = "";
    try {
      raw = fs.readFileSync(abs, "utf8");
    } catch {
      continue;
    }
    const meta = parseFrontmatter(raw);
    if (Object.keys(meta).length === 0) continue;
    const repoRel = relFromRepo(abs);
    // Store both repo-relative and absolute keys to match QMD row shapes reliably.
    addMetaKey(rows, repoRel, meta);
    addMetaKey(rows, abs, meta);
    // Mirror QMD displayPath style for collection-prefixed lookups.
    if (repoRel.startsWith("packages/")) {
      addMetaKey(
        rows,
        `orderly-packages/${repoRel.slice("packages/".length)}`,
        meta,
      );
    } else if (repoRel.startsWith("apps/ai-docs/")) {
      addMetaKey(
        rows,
        `orderly-ai-docs/${repoRel.slice("apps/ai-docs/".length)}`,
        meta,
      );
    }
  }
  return rows;
}

async function main() {
  const manifestPath = path.join(GENERATED_ROOT, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(
      "Run `pnpm --filter @orderly.network/ai-docs generate` first.",
    );
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    qmd?: { indexPath?: string };
  };
  const indexRel = manifest.qmd?.indexPath ?? "qmd/index.sqlite";
  const dbPath = path.join(GENERATED_ROOT, indexRel);
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const store = await createStore({
    dbPath,
    config: {
      collections: {
        [COLLECTION_AI_DOCS]: {
          path: AI_DOCS_ROOT,
          pattern: "**/*.md",
          ignore: [
            "generated/json/**",
            "generated/indexes/**",
            "generated/qmd/**",
            "node_modules/**",
          ],
        },
        [COLLECTION_PACKAGES]: {
          path: PACKAGES_ROOT,
          pattern: "**/*.md",
          ignore: [
            "**/node_modules/**",
            "**/dist/**",
            "**/coverage/**",
            "**/.turbo/**",
          ],
        },
      },
    },
  });

  try {
    const res = await store.update();
    process.stderr.write(
      `[ai-docs] qmd update: indexed=${res.indexed} updated=${res.updated} unchanged=${res.unchanged}\n`,
    );
  } catch (e) {
    console.error("[ai-docs] QMD index failed:", e);
    console.error(
      "If better-sqlite3 failed to load: from the repo root run `pnpm rebuild:better-sqlite3` (or `pnpm rebuild better-sqlite3 --pending -r`). " +
        "pnpm 10 only runs dependency install scripts for packages listed under `pnpm.onlyBuiltDependencies` in the root package.json.",
    );
    process.exit(1);
  } finally {
    await store.close();
  }

  const docMetaIndex = await buildDocMetaIndex();
  const docMetaAbs = path.join(GENERATED_ROOT, DOC_META_INDEX_REL);
  fs.mkdirSync(path.dirname(docMetaAbs), { recursive: true });
  fs.writeFileSync(
    docMetaAbs,
    JSON.stringify(docMetaIndex, null, 2) + "\n",
    "utf8",
  );

  const man = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    qmd?: { lastIndexBuildAt?: string | null; docMetaIndexPath?: string };
  };
  man.qmd = man.qmd ?? {};
  man.qmd.lastIndexBuildAt = new Date().toISOString();
  man.qmd.docMetaIndexPath = DOC_META_INDEX_REL;
  fs.writeFileSync(manifestPath, JSON.stringify(man, null, 2) + "\n", "utf8");
  console.warn("qmd:index: completed (manifest updated)", {
    dbPath: path.relative(REPO_ROOT, dbPath),
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
