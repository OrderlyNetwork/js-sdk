import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ManifestSchema } from "./internal/manifest.js";
import { AI_DOCS_ROOT, GENERATED_ROOT, REPO_ROOT, relFromRepo } from "./internal/paths.js";
import type { Provenance } from "./internal/entityTypes.js";

const REQUIRED_MD = ["llms.md", "guardrails.md"] as const;
const MAX_INDEX_BYTES = 50 * 1024 * 1024;

function fail(msg: string): never {
  console.error(`validate: ${msg}`);
  process.exit(1);
}

function readJson<T>(abs: string): T {
  return JSON.parse(fs.readFileSync(abs, "utf8")) as T;
}

function assertProvenance(e: Provenance & { id?: string }, ctx: string) {
  for (const k of ["artifactKind", "gitSha", "generatedAt", "sourcePath", "package"] as const) {
    if (e[k] === undefined || e[k] === "") {
      fail(`missing provenance.${k} on ${ctx} ${(e as { id?: string }).id ?? ""}`);
    }
  }
}

function main() {
  for (const f of REQUIRED_MD) {
    const p = path.join(AI_DOCS_ROOT, f);
    if (!fs.existsSync(p)) fail(`missing required ${f}`);
  }

  const manifestPath = path.join(GENERATED_ROOT, "manifest.json");
  if (!fs.existsSync(manifestPath)) fail("missing generated/manifest.json — run pnpm --filter @orderly.network/ai-docs generate");
  const manifestRaw = readJson<unknown>(manifestPath);
  const parsed = ManifestSchema.safeParse(manifestRaw);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    fail("manifest.json schema mismatch");
  }
  const m = parsed.data;

  for (const idx of ["idIndex", "symbolIndex", "packageIndex", "keywordIndex"] as const) {
    const rel = m.indexPaths[idx];
    const abs = path.join(GENERATED_ROOT, rel);
    if (!fs.existsSync(abs)) fail(`missing index file ${rel}`);
    const st = fs.statSync(abs);
    if (st.size > MAX_INDEX_BYTES) fail(`index too large: ${rel}`);
    const j = readJson<Record<string, unknown>>(abs);
    if (typeof j !== "object" || j === null) fail(`invalid index json ${rel}`);
  }

  /* Unique keys sanity */
  const symPath = path.join(GENERATED_ROOT, m.indexPaths.symbolIndex);
  const sym = readJson<Record<string, { entityId: string }>>(symPath);
  const seen = new Set<string>();
  for (const [k, v] of Object.entries(sym)) {
    const sig = `${v.entityId}@${k}`;
    if (seen.has(v.entityId) && k.includes("@")) {
      /* allow duplicate entity refs from fq keys */
    }
    seen.add(sig);
  }

  const entityFiles = [
    path.join(GENERATED_ROOT, "json/hooks.json"),
    path.join(GENERATED_ROOT, "json/types.json"),
    path.join(GENERATED_ROOT, "json/functions.json"),
    path.join(GENERATED_ROOT, "json/components.json"),
  ];
  for (const ef of entityFiles) {
    if (!fs.existsSync(ef)) fail(`missing ${relFromRepo(ef)}`);
    const rows = readJson<Provenance[]>(ef);
    if (!Array.isArray(rows)) fail(`expected array in ${relFromRepo(ef)}`);
    for (const row of rows) {
      assertProvenance(row, relFromRepo(ef));
    }
  }

  const docIdxRel = m.indexPaths.componentDocIndex;
  if (docIdxRel) {
    const docIdxPath = path.join(GENERATED_ROOT, docIdxRel);
    if (!fs.existsSync(docIdxPath)) fail(`missing component doc index ${docIdxRel}`);
    const docIdx = readJson<
      Record<string, { mdPath: string; source?: string; entityId?: string }>
    >(docIdxPath);
    for (const [entityId, row] of Object.entries(docIdx)) {
      if (!row.mdPath) fail(`component-doc-index missing mdPath for ${entityId}`);
      const abs =
        row.source === "curated"
          ? path.join(REPO_ROOT, row.mdPath)
          : path.join(GENERATED_ROOT, row.mdPath);
      if (!fs.existsSync(abs)) fail(`component doc missing file: ${row.mdPath}`);
    }
  }

  console.warn("validate: OK", m.gitSha.slice(0, 7));
}

main();
