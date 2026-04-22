import type { LoadedBundle } from "./bundle.js";

export type SymbolIndexEntry = LoadedBundle["symbolIndex"][string];

type IdIndexMeta = {
  kind?: string;
  path?: string;
  package?: string;
  title?: string;
  symbol?: string;
};

/**
 * Locates a symbol-index row for a full entity id (linear scan; symbol rows are duplicated per alias key).
 */
function findSymbolEntryByEntityId(
  bundle: LoadedBundle,
  entityId: string,
): SymbolIndexEntry | undefined {
  for (const entry of Object.values(bundle.symbolIndex)) {
    if (entry.entityId === entityId) return entry;
  }
  return undefined;
}

/**
 * Resolves a user query to a single component or type using id-index, then symbol-index (direct and `@pkg:Name` aliases).
 *
 * Contract: unqualified names that map to a non-target artifact (e.g. `Avatar` → function) return `INVALID_INPUT` with a hint to use `@scope/pkg:Avatar` or the `component.*` / `type.*` id.
 */
export function resolveEntityByArtifactKind(
  bundle: LoadedBundle,
  raw: string,
  artifactKind: "component" | "type",
):
  | { ok: true; entityId: string; entry: SymbolIndexEntry }
  | {
      ok: false;
      code: "NOT_FOUND" | "INVALID_INPUT";
      message: string;
      hint?: string;
    } {
  const query = raw.trim();
  if (!query) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: "Query must be non-empty.",
    };
  }

  const wantKind = artifactKind === "component" ? "component" : "type";
  const idMeta = bundle.idIndex[query] as IdIndexMeta | undefined;
  if (idMeta?.kind === wantKind) {
    let entry = findSymbolEntryByEntityId(bundle, query);
    if (!entry) {
      const synthetic: SymbolIndexEntry = {
        entityId: query,
        artifactKind,
        jsonPath:
          artifactKind === "component"
            ? "json/components.json"
            : "json/types.json",
        sourcePath: idMeta.path ?? "",
        package: idMeta.package ?? "",
      };
      entry = synthetic;
    } else if (entry.artifactKind !== artifactKind) {
      return {
        ok: false,
        code: "INVALID_INPUT",
        message: `Entity id "${query}" is indexed as ${entry.artifactKind}, expected ${artifactKind}.`,
      };
    }
    return { ok: true, entityId: query, entry };
  }

  if (idMeta?.kind && idMeta.kind !== wantKind) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: `Entity id "${query}" is a ${idMeta.kind}, not a ${artifactKind}.`,
      hint: `Use the API matching that kind (e.g. type vs component).`,
    };
  }

  const direct = bundle.symbolIndex[query];
  if (direct?.artifactKind === artifactKind) {
    return { ok: true, entityId: direct.entityId, entry: direct };
  }
  if (direct && direct.artifactKind !== artifactKind) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: `"${query}" resolves to ${direct.artifactKind} "${direct.entityId}", not ${artifactKind}.`,
      hint:
        artifactKind === "component"
          ? "Use `@package/name:ExportName` for the component export, or a full `component.*` entity id from the id-index."
          : "Use `@package/name:TypeName` or a full `type.*` entity id.",
    };
  }

  const qualified: SymbolIndexEntry[] = [];
  const suffix = `:${query}`;
  for (const [key, entry] of Object.entries(bundle.symbolIndex)) {
    if (entry.artifactKind !== artifactKind) continue;
    if (key === query || key.endsWith(suffix)) {
      qualified.push(entry);
    }
  }
  const byEntity = new Map<string, SymbolIndexEntry>();
  for (const e of qualified) {
    byEntity.set(e.entityId, e);
  }
  if (byEntity.size === 1) {
    const entry = [...byEntity.values()][0]!;
    return { ok: true, entityId: entry.entityId, entry };
  }
  if (byEntity.size > 1) {
    return {
      ok: false,
      code: "INVALID_INPUT",
      message: `Ambiguous ${artifactKind} name "${query}" (${byEntity.size} definitions).`,
      hint: "Disambiguate with `@scope/package:Name` or the full entity id (component.* / type.*).",
    };
  }

  return {
    ok: false,
    code: "NOT_FOUND",
    message: `No ${artifactKind} found for "${query}".`,
  };
}
