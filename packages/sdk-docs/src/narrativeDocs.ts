import fs from "node:fs";
import path from "node:path";
import type { LoadedBundle } from "./bundle.js";
import { errResult, okResult } from "./envelope.js";
import { resolveRepoRoot } from "./paths.js";
import type { DocsResult } from "./types.js";

export type NarrativeDocBody = {
  path: string;
  /** Full file text (no chunk-index fallback). */
  text: string;
  sections: Array<{
    id: string;
    heading: string;
    text: string;
    startLine?: number;
    endLine?: number;
  }>;
  source: "repo-markdown";
};

function normalizeSlug(raw: string): string {
  const s = raw.trim().replace(/\.md$/i, "");
  if (!s || s.includes("..") || s.includes("/") || s.includes("\\")) {
    return "";
  }
  return s;
}

function markdownRoot(bundle: LoadedBundle): string {
  const mr = bundle.manifest.roots?.markdownRoot ?? "apps/ai-docs";
  return mr;
}

/**
 * Read markdown under `apps/ai-docs/...` from the resolved monorepo root.
 */
function tryReadMarkdownFile(
  bundle: LoadedBundle,
  relFromMarkdownRoot: string,
): string | null {
  try {
    const root = resolveRepoRoot();
    const abs = path.join(root, markdownRoot(bundle), relFromMarkdownRoot);
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      return fs.readFileSync(abs, "utf8");
    }
  } catch {
    /* not in monorepo or ORDERLY_REPO_ROOT invalid */
  }
  return null;
}

function readOrNotFound(
  bundle: LoadedBundle,
  relFromMarkdownRoot: string,
  citationPath: string,
  started: number,
  label: string,
): DocsResult<NarrativeDocBody> {
  const repoFull = tryReadMarkdownFile(bundle, relFromMarkdownRoot);
  if (repoFull !== null) {
    return okResult(
      bundle,
      {
        path: citationPath,
        text: repoFull,
        sections: [],
        source: "repo-markdown",
      },
      "narrative",
      [{ path: citationPath, why: `${label} (repo file)` }],
      started,
    );
  }
  return errResult(
    "NOT_FOUND",
    `Missing markdown for ${label} at ${citationPath}.`,
    "Use a monorepo checkout with apps/ai-docs, or copy the workflow/recipe files next to your bundle.",
    bundle,
  );
}

/**
 * Curated workflow markdown (repo file only).
 */
export function getWorkflow(
  bundle: LoadedBundle,
  slug: string,
  started: number,
): DocsResult<NarrativeDocBody> {
  const s = normalizeSlug(slug);
  if (!s) {
    return errResult(
      "INVALID_INPUT",
      "Invalid workflow slug (use a single filename segment without path separators).",
      undefined,
      bundle,
    );
  }
  const rel = path.join("workflows", `${s}.md`);
  const citationPath = path.join(markdownRoot(bundle), rel).replace(/\\/g, "/");
  return readOrNotFound(bundle, rel, citationPath, started, `workflow:${s}`);
}

/**
 * Minimal recipe markdown (repo file only).
 */
export function getRecipe(
  bundle: LoadedBundle,
  name: string,
  started: number,
): DocsResult<NarrativeDocBody> {
  const s = normalizeSlug(name);
  if (!s) {
    return errResult(
      "INVALID_INPUT",
      "Invalid recipe name (use a single filename segment without path separators).",
      undefined,
      bundle,
    );
  }
  const rel = path.join("recipes", `${s}.md`);
  const citationPath = path.join(markdownRoot(bundle), rel).replace(/\\/g, "/");
  return readOrNotFound(bundle, rel, citationPath, started, `recipe:${s}`);
}

/**
 * Guardrails document (repo file only).
 */
export function getGuardrails(
  bundle: LoadedBundle,
  started: number,
): DocsResult<NarrativeDocBody> {
  const rel = "guardrails.md";
  const citationPath = path.join(markdownRoot(bundle), rel).replace(/\\/g, "/");
  return readOrNotFound(bundle, rel, citationPath, started, "guardrails");
}
