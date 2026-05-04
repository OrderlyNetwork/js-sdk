import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import type { Provenance } from "./internal/entityTypes.js";
import { ManifestSchema } from "./internal/manifest.js";
import {
  AI_DOCS_ROOT,
  GENERATED_ROOT,
  REPO_ROOT,
  relFromRepo,
} from "./internal/paths.js";

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
  for (const k of [
    "artifactKind",
    "gitSha",
    "generatedAt",
    "sourcePath",
    "package",
  ] as const) {
    if (e[k] === undefined || e[k] === "") {
      fail(
        `missing provenance.${k} on ${ctx} ${(e as { id?: string }).id ?? ""}`,
      );
    }
  }
}

/** Reads numeric quality thresholds from env with deterministic defaults. */
function readThreshold(envName: string, fallback: number): number {
  const raw = process.env[envName];
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    fail(`invalid threshold ${envName}=${raw}; expected 0..1`);
  }
  return parsed;
}

function isStrictMode(): boolean {
  return process.env.AI_DOCS_STRICT === "1";
}

/**
 * Applies quality gates as warnings by default and hard failures in strict mode.
 */
function enforceQualityGate(label: string, actual: number, minimum: number) {
  if (actual >= minimum) return;
  const msg = `${label} below threshold: ${(actual * 100).toFixed(1)}% < ${(minimum * 100).toFixed(1)}%`;
  if (isStrictMode()) fail(msg);
  console.warn(`validate: WARN ${msg}`);
}

type HookRow = Provenance & {
  jsDoc?: string;
  deprecated?: boolean;
  sourceTag?: string;
  deprecationMessage?: string;
};

type ComponentRow = Provenance & {
  jsDoc?: string;
  props?: Array<{ description?: string }>;
};

function main() {
  for (const f of REQUIRED_MD) {
    const p = path.join(AI_DOCS_ROOT, f);
    if (!fs.existsSync(p)) fail(`missing required ${f}`);
  }

  const manifestPath = path.join(GENERATED_ROOT, "manifest.json");
  if (!fs.existsSync(manifestPath))
    fail(
      "missing generated/manifest.json — run pnpm --filter @orderly.network/ai-docs generate",
    );
  const manifestRaw = readJson<unknown>(manifestPath);
  const parsed = ManifestSchema.safeParse(manifestRaw);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    fail("manifest.json schema mismatch");
  }
  const m = parsed.data;

  for (const idx of [
    "idIndex",
    "symbolIndex",
    "packageIndex",
    "keywordIndex",
  ] as const) {
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

  const hooks = readJson<HookRow[]>(
    path.join(GENERATED_ROOT, "json/hooks.json"),
  );
  const components = readJson<ComponentRow[]>(
    path.join(GENERATED_ROOT, "json/components.json"),
  );

  const minHookJsDocCoverage = readThreshold(
    "AI_DOCS_MIN_HOOK_JSDOC_COVERAGE",
    0.1,
  );
  const minComponentDescriptionCoverage = readThreshold(
    "AI_DOCS_MIN_COMPONENT_DESCRIPTION_COVERAGE",
    0.05,
  );
  const minPropDescriptionCoverage = readThreshold(
    "AI_DOCS_MIN_PROP_DESCRIPTION_COVERAGE",
    0.1,
  );
  const minDeprecatedSignalCoverage = readThreshold(
    "AI_DOCS_MIN_DEPRECATED_SIGNAL_COVERAGE",
    1,
  );

  const hookWithJsDoc = hooks.filter((h) => h.jsDoc?.trim()).length;
  const hookJsDocCoverage = hooks.length ? hookWithJsDoc / hooks.length : 1;
  enforceQualityGate(
    "hook jsDoc coverage",
    hookJsDocCoverage,
    minHookJsDocCoverage,
  );

  const componentsWithDescription = components.filter((c) =>
    c.jsDoc?.trim(),
  ).length;
  const componentDescriptionCoverage = components.length
    ? componentsWithDescription / components.length
    : 1;
  enforceQualityGate(
    "component description coverage",
    componentDescriptionCoverage,
    minComponentDescriptionCoverage,
  );

  const totalProps = components.reduce(
    (acc, c) => acc + (c.props?.length ?? 0),
    0,
  );
  const propsWithDescription = components.reduce(
    (acc, c) =>
      acc + (c.props?.filter((p) => p.description?.trim()).length ?? 0),
    0,
  );
  const propDescriptionCoverage = totalProps
    ? propsWithDescription / totalProps
    : 1;
  enforceQualityGate(
    "component prop description coverage",
    propDescriptionCoverage,
    minPropDescriptionCoverage,
  );

  const explicitlyDeprecatedHooks = hooks.filter(
    (h) => h.sourceTag === "deprecated" || h.deprecationMessage?.trim(),
  );
  const taggedDeprecatedHooks = explicitlyDeprecatedHooks.filter(
    (h) => h.deprecated,
  ).length;
  const deprecatedSignalCoverage = explicitlyDeprecatedHooks.length
    ? taggedDeprecatedHooks / explicitlyDeprecatedHooks.length
    : 1;
  enforceQualityGate(
    "deprecated hook tagging coverage",
    deprecatedSignalCoverage,
    minDeprecatedSignalCoverage,
  );

  const docIdxRel = m.indexPaths.componentDocIndex;
  if (docIdxRel) {
    const docIdxPath = path.join(GENERATED_ROOT, docIdxRel);
    if (!fs.existsSync(docIdxPath))
      fail(`missing component doc index ${docIdxRel}`);
    const docIdx =
      readJson<
        Record<string, { mdPath: string; source?: string; entityId?: string }>
      >(docIdxPath);
    for (const [entityId, row] of Object.entries(docIdx)) {
      if (!row.mdPath)
        fail(`component-doc-index missing mdPath for ${entityId}`);
      const abs =
        row.source === "curated"
          ? path.join(REPO_ROOT, row.mdPath)
          : path.join(GENERATED_ROOT, row.mdPath);
      if (!fs.existsSync(abs))
        fail(`component doc missing file: ${row.mdPath}`);
    }
  }

  console.warn("validate: OK", m.gitSha.slice(0, 7));
}

main();
