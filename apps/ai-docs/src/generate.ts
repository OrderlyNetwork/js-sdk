import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildComponentDocArtifacts } from "./internal/buildComponentDocArtifacts.js";
import { buildIndexes } from "./internal/buildIndexes.js";
import {
  discoverUiComponentSamples,
  mergeComponentSamples,
} from "./internal/discoverUiComponentSamples.js";
import {
  discoverWorkspacePackages,
  mergePackageTargets,
} from "./internal/discoverWorkspacePackages.js";
import type { ComponentSample } from "./internal/extractComponents.js";
import { extractComponentSamples } from "./internal/extractComponents.js";
import { extractFromPackage } from "./internal/extractSymbols.js";
import { resolveGitSha } from "./internal/gitMeta.js";
import { readPackageVersion } from "./internal/packageProgram.js";
import type { PackageTarget } from "./internal/packageProgram.js";
import {
  AI_DOCS_ROOT,
  GENERATED_ROOT,
  REPO_ROOT,
  relFromRepo,
  writeJsonUnderGenerated,
} from "./internal/paths.js";

function readJsonFile<T>(abs: string): T {
  return JSON.parse(fs.readFileSync(abs, "utf8")) as T;
}

function mkdir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function countResolution(entities: { resolutionLevel?: string }[]) {
  let full = 0;
  let degraded = 0;
  for (const e of entities) {
    if (e.resolutionLevel === "syntax-only" || e.resolutionLevel === "partial") degraded++;
    else full++;
  }
  return { full, degraded };
}

async function main() {
  const gitSha = resolveGitSha();
  const generatedAt = new Date(
    process.env.SOURCE_DATE_EPOCH
      ? Number(process.env.SOURCE_DATE_EPOCH) * 1000
      : Date.now(),
  ).toISOString();

  mkdir(path.join(GENERATED_ROOT, "json"));
  mkdir(path.join(GENERATED_ROOT, "indexes"));
  mkdir(path.join(GENERATED_ROOT, "docs-md"));

  const allowlist = readJsonFile<{
    discoverWorkspace?: boolean;
    excludePackages?: string[];
    packages?: PackageTarget[];
    /** Extra TSX files outside auto UI discovery (`packages/ui`, `packages/ui-*`) */
    componentSamples?: ComponentSample[];
  }>(path.join(AI_DOCS_ROOT, "allowlist.json"));
  const policy = readJsonFile<{ apiVersion: string }>(path.join(AI_DOCS_ROOT, "build-policy.json"));

  const exclude = new Set(allowlist.excludePackages ?? []);
  const discovered =
    allowlist.discoverWorkspace !== false
      ? discoverWorkspacePackages({ excludePackages: exclude })
      : [];
  const packages = mergePackageTargets(discovered, allowlist.packages ?? []);
  const uiSamples = discoverUiComponentSamples(REPO_ROOT);
  const componentSamples = mergeComponentSamples(uiSamples, allowlist.componentSamples ?? []);

  const allHooks: import("./internal/entityTypes.js").HookEntity[] = [];
  const allTypes: import("./internal/entityTypes.js").TypeEntity[] = [];
  const allFns: import("./internal/entityTypes.js").FunctionEntity[] = [];

  let skipped = 0;
  for (const pkg of packages) {
    process.stderr.write(`extract ${pkg.name}...\n`);
    try {
      const { hooks, types, functions } = extractFromPackage(pkg, gitSha, generatedAt);
      allHooks.push(...hooks);
      allTypes.push(...types);
      allFns.push(...functions);
    } catch (e) {
      skipped++;
      console.error(`[ai-docs] skip ${pkg.name}:`, e);
      if (process.env.AI_DOCS_STRICT === "1") throw e;
    }
  }

  process.stderr.write(
    `components: ${componentSamples.length} UI package(s), ${componentSamples.reduce((n, s) => n + s.files.length, 0)} tsx file(s)\n`,
  );
  const components = extractComponentSamples(componentSamples, gitSha, generatedAt, REPO_ROOT);

  /** Repo-root–independent paths (relative to `apps/ai-docs/generated/`) for manifest + symbol index. */
  const hooksPath = "json/hooks.json";
  const typesPath = "json/types.json";
  const functionsPath = "json/functions.json";
  const componentsPath = "json/components.json";

  writeJsonUnderGenerated(hooksPath, allHooks);
  writeJsonUnderGenerated(typesPath, allTypes);
  writeJsonUnderGenerated(functionsPath, allFns);
  writeJsonUnderGenerated(componentsPath, components);

  const { idIndex, symbolIndex, packageIndex, keywordIndex } = buildIndexes({
    hooks: allHooks,
    types: allTypes,
    functions: allFns,
    components,
    jsonRelPaths: {
      hooks: hooksPath,
      types: typesPath,
      functions: functionsPath,
      components: componentsPath,
    },
  });

  const idPath = "indexes/id-index.json";
  const symPath = "indexes/symbol-index.json";
  const pkgPath = "indexes/package-index.json";
  const kwPath = "indexes/keyword-index.json";

  writeJsonUnderGenerated(idPath, idIndex);
  writeJsonUnderGenerated(symPath, symbolIndex);
  writeJsonUnderGenerated(pkgPath, packageIndex);
  writeJsonUnderGenerated(kwPath, keywordIndex);

  const { index: componentDocIndex, indexRelPath: componentDocIndexPath } =
    await buildComponentDocArtifacts(components);
  writeJsonUnderGenerated(componentDocIndexPath, componentDocIndex);

  const rootVer = readPackageVersion(REPO_ROOT) ?? null;

  const flatEntities = [...allHooks, ...allTypes, ...allFns, ...components];
  const { full, degraded } = countResolution(flatEntities);

  const manifest = {
    schemaVersion: "1",
    gitSha,
    generatedAt,
    releaseVersion: rootVer,
    artifactKinds: ["markdown", "component-json", "indexes", "hooks", "types"],
    roots: {
      markdownRoot: relFromRepo(AI_DOCS_ROOT),
      /** Manifest lives inside generated; paths in this file are relative to this folder. */
      generatedRoot: ".",
    },
    indexPaths: {
      idIndex: idPath,
      symbolIndex: symPath,
      packageIndex: pkgPath,
      keywordIndex: kwPath,
      componentDocIndex: componentDocIndexPath,
    },
    qmd: {
      collectionId: "orderly-ai-docs",
      indexPath: "qmd/index.sqlite",
      embeddingModelId: null,
      lastIndexBuildAt: null,
    },
    analysisStats: {
      totalSymbols: flatEntities.length,
      fullyResolved: full,
      degradedCount: degraded,
    },
  };

  writeJsonUnderGenerated("manifest.json", manifest);
  writeJsonUnderGenerated("build-stamp.json", { gitSha, generatedAt });

  process.stderr.write(
    `done: ${flatEntities.length} entities from ${packages.length - skipped}/${packages.length} packages (skipped ${skipped}), apiVersion=${policy.apiVersion}\n`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
