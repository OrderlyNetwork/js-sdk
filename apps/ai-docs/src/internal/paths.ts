import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Repository root: `apps/ai-docs/src/internal` → four levels up (avoid `lib/` — root .gitignore) */
export const REPO_ROOT = path.resolve(here, "../../../..");

/** `apps/ai-docs` root */
export const AI_DOCS_ROOT = path.join(REPO_ROOT, "apps/ai-docs");

/** Workspace packages root (`packages/*`) — curated READMEs, CHANGELOGs, component docs, etc. */
export const PACKAGES_ROOT = path.join(REPO_ROOT, "packages");

export const GENERATED_ROOT = path.join(AI_DOCS_ROOT, "generated");

export function relFromRepo(abs: string) {
  return path.relative(REPO_ROOT, abs).split(path.sep).join("/");
}

/**
 * Writes JSON under `apps/ai-docs/generated/{relFromGenerated}` (paths in manifest/indexes use the same rel strings).
 */
export function writeJsonUnderGenerated(relFromGenerated: string, data: unknown) {
  const abs = path.join(GENERATED_ROOT, relFromGenerated);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2) + "\n", "utf8");
}
