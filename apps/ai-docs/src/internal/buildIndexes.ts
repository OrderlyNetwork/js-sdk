import type { ComponentEntity, FunctionEntity, HookEntity, TypeEntity } from "./entityTypes.js";

export type IdIndexEntry = {
  kind: string;
  path: string;
  title?: string;
  package?: string;
  symbol?: string;
};

export type SymbolIndexEntry = {
  entityId: string;
  artifactKind: string;
  jsonPath: string;
  sourcePath: string;
  package: string;
};

export type PackageIndexEntry = {
  exports: string[];
  hookIds: string[];
  typeIds: string[];
  functionIds: string[];
  componentIds: string[];
};

/**
 * Assemble id-index, symbol-index, package-index, keyword-index (tech §3.2–3.3).
 */
export function buildIndexes(args: {
  hooks: HookEntity[];
  types: TypeEntity[];
  functions: FunctionEntity[];
  components: ComponentEntity[];
  jsonRelPaths: {
    hooks: string;
    types: string;
    functions: string;
    components: string;
  };
}) {
  const idIndex: Record<string, IdIndexEntry> = {};
  const symbolIndex: Record<string, SymbolIndexEntry> = {};
  const packageIndex: Record<string, PackageIndexEntry> = {};
  const keywordIndex: Record<string, string[]> = {};

  const addKw = (kw: string, id: string) => {
    const k = kw.toLowerCase().normalize("NFC");
    if (!k || k.length < 2) return;
    const plain = k.replace(/^@orderly\.network\//, "");
    for (const term of [k, plain]) {
      if (!keywordIndex[term]) keywordIndex[term] = [];
      if (!keywordIndex[term]!.includes(id)) keywordIndex[term]!.push(id);
    }
  };

  const ensurePkg = (pkg: string): PackageIndexEntry => {
    if (!packageIndex[pkg]) {
      packageIndex[pkg] = {
        exports: [],
        hookIds: [],
        typeIds: [],
        functionIds: [],
        componentIds: [],
      };
    }
    return packageIndex[pkg]!;
  };

  const reg = (
    entity: HookEntity | TypeEntity | FunctionEntity | ComponentEntity,
    jsonPath: string,
  ) => {
    idIndex[entity.id] = {
      kind: entity.artifactKind,
      path: entity.sourcePath,
      title: entity.name,
      package: entity.package,
      symbol: entity.name,
    };
    const symKey = `${entity.package}:${entity.name}`;
    const existingSym = symbolIndex[symKey];
    // Do not let a misclassified `function.*` replace `component.*` for the same export (e.g. Button).
    if (!(existingSym?.artifactKind === "component" && entity.artifactKind === "function")) {
      symbolIndex[symKey] = {
        entityId: entity.id,
        artifactKind: entity.artifactKind,
        jsonPath,
        sourcePath: entity.sourcePath,
        package: entity.package,
      };
    }

    const shortExisting = symbolIndex[entity.name];
    /* Prefer first occurrence for short names to avoid cross-package thrash */
    if (!shortExisting) {
      symbolIndex[entity.name] = symbolIndex[symKey]!;
    } else if (
      entity.artifactKind === "component" &&
      shortExisting.artifactKind === "function" &&
      shortExisting.package === entity.package
    ) {
      // Same package: component wins bare `Button` over a callable also indexed as function.
      symbolIndex[entity.name] = symbolIndex[symKey]!;
    }

    const pk = ensurePkg(entity.package);
    pk.exports.push(entity.name);
    if (entity.artifactKind === "hook") pk.hookIds.push(entity.id);
    if (entity.artifactKind === "type") pk.typeIds.push(entity.id);
    if (entity.artifactKind === "function") pk.functionIds.push(entity.id);
    if (entity.artifactKind === "component") pk.componentIds.push(entity.id);

    addKw(entity.name, entity.id);
    addKw(entity.package, entity.id);
    const short = entity.package.replace("@orderly.network/", "");
    addKw(short, entity.id);

    if ("props" in entity && entity.props) {
      for (const p of entity.props) addKw(p.name, entity.id);
    }
    if ("params" in entity && entity.params) {
      for (const p of entity.params) addKw(p.name, entity.id);
    }
  };

  for (const h of args.hooks) reg(h, args.jsonRelPaths.hooks);
  for (const t of args.types) reg(t, args.jsonRelPaths.types);
  // Components before functions so `symbolIndex["Button"]` maps to component.* when both exist.
  for (const c of args.components) reg(c, args.jsonRelPaths.components);
  for (const f of args.functions) reg(f, args.jsonRelPaths.functions);

  for (const pkg of Object.keys(packageIndex)) {
    const e = packageIndex[pkg]!;
    e.exports = [...new Set(e.exports)].sort();
  }

  return { idIndex, symbolIndex, packageIndex, keywordIndex };
}
