import fs from "node:fs";
import path from "node:path";
import type { LoadedBundle } from "./bundle.js";
import { readEntityJson } from "./bundle.js";
import { resolveEntityByArtifactKind } from "./entityResolve.js";
import { errResult, okResult } from "./envelope.js";
import type { Citation, DocsResult } from "./types.js";

type JsonEntity = { id?: string; name?: string; artifactKind?: string };

function findInShard(
  generatedRoot: string,
  jsonRelPath: string,
  entityId: string,
): JsonEntity | undefined {
  const rows = readEntityJson<JsonEntity>(generatedRoot, jsonRelPath);
  return rows.find((r) => r.id === entityId);
}

function entityCitation(
  entry: { sourcePath: string; entityId: string },
  via: string,
): Citation {
  return {
    path: entry.sourcePath,
    why: via,
    id: entry.entityId,
  };
}

/**
 * Exact structured lookup for a React component record (props metadata, etc.).
 */
export function getComponent(
  bundle: LoadedBundle,
  query: string,
  started: number,
): DocsResult<Record<string, unknown>> {
  const resolved = resolveEntityByArtifactKind(bundle, query, "component");
  if (!resolved.ok) {
    return errResult(
      resolved.code,
      resolved.message,
      resolved.hint,
      bundle,
    ) as DocsResult<Record<string, unknown>>;
  }
  const { entityId, entry } = resolved;
  const record = findInShard(bundle.generatedRoot, entry.jsonPath, entityId);
  if (!record) {
    return errResult(
      "NOT_FOUND",
      `Component "${entityId}" missing from shard ${entry.jsonPath}.`,
      "Regenerate AI docs (pnpm --filter @orderly.network/ai-docs generate).",
      bundle,
    );
  }
  const resLevel = (record as { resolutionLevel?: string }).resolutionLevel;
  return okResult(
    bundle,
    record as Record<string, unknown>,
    "exact",
    [
      entityCitation(
        { sourcePath: entry.sourcePath, entityId },
        "symbol-index + json/components",
      ),
    ],
    started,
    resLevel === "syntax-only"
      ? { resolutionLevel: "syntax-only" as const }
      : undefined,
  );
}

/**
 * Exact structured lookup for a type / enum record.
 */
export function getType(
  bundle: LoadedBundle,
  query: string,
  started: number,
): DocsResult<Record<string, unknown>> {
  const resolved = resolveEntityByArtifactKind(bundle, query, "type");
  if (!resolved.ok) {
    return errResult(
      resolved.code,
      resolved.message,
      resolved.hint,
      bundle,
    ) as DocsResult<Record<string, unknown>>;
  }
  const { entityId, entry } = resolved;
  const record = findInShard(bundle.generatedRoot, entry.jsonPath, entityId);
  if (!record) {
    return errResult(
      "NOT_FOUND",
      `Type "${entityId}" missing from shard ${entry.jsonPath}.`,
      "Regenerate AI docs (pnpm --filter @orderly.network/ai-docs generate).",
      bundle,
    );
  }
  return okResult(
    bundle,
    record as Record<string, unknown>,
    "exact",
    [
      entityCitation(
        { sourcePath: entry.sourcePath, entityId },
        "symbol-index + json/types",
      ),
    ],
    started,
  );
}

export type PackageSurfaceData = {
  packageName: string;
  exports: string[];
  componentIds: string[];
};

/**
 * Returns the indexed export surface for an npm package name (e.g. `@orderly.network/ui`).
 */
export function getPackageSurface(
  bundle: LoadedBundle,
  packageName: string,
  started: number,
): DocsResult<PackageSurfaceData> {
  const name = packageName.trim();
  if (!name) {
    return errResult(
      "INVALID_INPUT",
      "packageName must be non-empty.",
      undefined,
      bundle,
    );
  }
  const row = bundle.packageIndex[name] as PackageSurfaceData | undefined;
  if (!row || !Array.isArray(row.exports)) {
    return errResult(
      "NOT_FOUND",
      `No package index entry for "${name}".`,
      undefined,
      bundle,
    );
  }
  const data: PackageSurfaceData = {
    packageName: name,
    exports: row.exports,
    componentIds: Array.isArray(row.componentIds) ? row.componentIds : [],
  };
  return okResult(
    bundle,
    data,
    "exact",
    [{ path: name, why: "package-index" }],
    started,
  );
}

export type ReleaseContextData = {
  manifest: LoadedBundle["manifest"];
  buildStamp: { gitSha: string; generatedAt: string } | null;
};

/**
 * Manifest + optional `build-stamp.json` for release / provenance context.
 */
export function getReleaseContext(
  bundle: LoadedBundle,
  started: number,
): DocsResult<ReleaseContextData> {
  const stampPath = path.join(bundle.generatedRoot, "build-stamp.json");
  let buildStamp: ReleaseContextData["buildStamp"] = null;
  if (fs.existsSync(stampPath)) {
    try {
      buildStamp = JSON.parse(fs.readFileSync(stampPath, "utf8")) as {
        gitSha: string;
        generatedAt: string;
      };
    } catch {
      buildStamp = null;
    }
  }
  return okResult(
    bundle,
    { manifest: bundle.manifest, buildStamp },
    "manifest",
    [{ path: "manifest.json", why: "release-context" }],
    started,
  );
}
