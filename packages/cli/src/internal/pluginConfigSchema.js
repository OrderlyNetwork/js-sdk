/**
 * Validation and derivation for plugin `configSchema.json`.
 *
 * The schema is the subset of JSON Schema rendered as a dynamic options form
 * in Orderly One. All values are public frontend config — there are no
 * secrets. Mirrors `PluginConfigJsonSchema` in `@dex-creator/schemas`.
 */

const MAX_CONFIG_SCHEMA_BYTES = 32 * 1024;
const MAX_PROPERTIES = 50;
const MAX_KEY_LENGTH = 120;
const MAX_TITLE_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_STRING_LENGTH = 2000;
const MAX_PATTERN_LENGTH = 300;
const MAX_ENUM_VALUES = 50;
const MAX_ENUM_STRING_LENGTH = 200;

const FIELD_TYPES = ["string", "number", "integer", "boolean"];

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Validate a parsed configSchema value.
 * @param {unknown} schema
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateConfigSchema(schema) {
  const errors = [];

  if (!isRecord(schema)) {
    return { valid: false, errors: ["configSchema must be an object"] };
  }

  if (schema.type !== "object") {
    errors.push('configSchema.type must be "object"');
  }

  if (!isRecord(schema.properties)) {
    errors.push("configSchema.properties must be an object");
  }

  const required = schema.required ?? [];
  if (
    !Array.isArray(required) ||
    required.some((key) => typeof key !== "string")
  ) {
    errors.push("configSchema.required must be an array of strings");
  }

  if (
    schema.additionalProperties !== undefined &&
    schema.additionalProperties !== false
  ) {
    errors.push("configSchema.additionalProperties must be false");
  }

  const properties = isRecord(schema.properties) ? schema.properties : {};
  const keys = Object.keys(properties);
  if (keys.length > MAX_PROPERTIES) {
    errors.push(
      `configSchema has too many properties (${keys.length}), maximum is ${MAX_PROPERTIES}`,
    );
  }

  for (const key of keys) {
    if (key.length > MAX_KEY_LENGTH) {
      errors.push(`property name "${key}" exceeds ${MAX_KEY_LENGTH} chars`);
      continue;
    }
    validateField(key, properties[key], errors);
  }

  if (Array.isArray(required)) {
    for (const key of required) {
      if (typeof key === "string" && !isRecord(properties[key])) {
        errors.push(`required field "${key}" is not declared in properties`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * @param {string} key
 * @param {unknown} field
 * @param {string[]} errors
 */
function validateField(key, field, errors) {
  const where = `property "${key}"`;
  if (!isRecord(field)) {
    errors.push(`${where} must be an object`);
    return;
  }

  if (!FIELD_TYPES.includes(field.type)) {
    errors.push(
      `${where}.type must be one of ${FIELD_TYPES.join(", ")}, got: ${JSON.stringify(field.type)}`,
    );
    return;
  }

  if (field.title !== undefined) {
    if (
      typeof field.title !== "string" ||
      field.title.length > MAX_TITLE_LENGTH
    ) {
      errors.push(
        `${where}.title must be a string up to ${MAX_TITLE_LENGTH} chars`,
      );
    }
  }
  if (field.description !== undefined) {
    if (
      typeof field.description !== "string" ||
      field.description.length > MAX_DESCRIPTION_LENGTH
    ) {
      errors.push(
        `${where}.description must be a string up to ${MAX_DESCRIPTION_LENGTH} chars`,
      );
    }
  }
  if (
    field.default !== undefined &&
    !["string", "number", "boolean"].includes(typeof field.default)
  ) {
    errors.push(`${where}.default must be a string, number or boolean`);
  }

  if (field.type === "string") {
    validateStringField(where, field, errors);
  } else if (field.type === "number" || field.type === "integer") {
    validateNumberField(where, field, errors);
  }
}

/**
 * @param {string} where
 * @param {Record<string, unknown>} field
 * @param {string[]} errors
 */
function validateStringField(where, field, errors) {
  if (
    field.minLength !== undefined &&
    (!Number.isInteger(field.minLength) ||
      field.minLength < 0 ||
      field.minLength > MAX_STRING_LENGTH)
  ) {
    errors.push(`${where}.minLength must be an integer 0-${MAX_STRING_LENGTH}`);
  }
  if (
    field.maxLength !== undefined &&
    (!Number.isInteger(field.maxLength) ||
      field.maxLength < 1 ||
      field.maxLength > MAX_STRING_LENGTH)
  ) {
    errors.push(`${where}.maxLength must be an integer 1-${MAX_STRING_LENGTH}`);
  }
  if (field.pattern !== undefined) {
    if (
      typeof field.pattern !== "string" ||
      field.pattern.length > MAX_PATTERN_LENGTH
    ) {
      errors.push(
        `${where}.pattern must be a string up to ${MAX_PATTERN_LENGTH} chars`,
      );
    } else {
      try {
        // eslint-disable-next-line no-new
        new RegExp(field.pattern);
      } catch {
        errors.push(`${where}.pattern is not a valid regular expression`);
      }
    }
  }
  if (field.enum !== undefined) {
    if (
      !Array.isArray(field.enum) ||
      field.enum.length > MAX_ENUM_VALUES ||
      field.enum.some(
        (v) => typeof v !== "string" || v.length > MAX_ENUM_STRING_LENGTH,
      )
    ) {
      errors.push(
        `${where}.enum must be an array of up to ${MAX_ENUM_VALUES} strings`,
      );
    }
  }
}

/**
 * @param {string} where
 * @param {Record<string, unknown>} field
 * @param {string[]} errors
 */
function validateNumberField(where, field, errors) {
  for (const bound of ["minimum", "maximum"]) {
    if (
      field[bound] !== undefined &&
      (typeof field[bound] !== "number" || Number.isNaN(field[bound]))
    ) {
      errors.push(`${where}.${bound} must be a number`);
    }
  }
  if (field.enum !== undefined) {
    if (
      !Array.isArray(field.enum) ||
      field.enum.length > MAX_ENUM_VALUES ||
      field.enum.some((v) => typeof v !== "number" || Number.isNaN(v))
    ) {
      errors.push(
        `${where}.enum must be an array of up to ${MAX_ENUM_VALUES} numbers`,
      );
    }
  }
}

/**
 * Derive a config schema from the plugin's `register*Plugin(options)` signature
 * using the TypeScript compiler API. No template conventions required — the
 * parameter type of the register function is the contract.
 *
 * Supported: string/number/boolean props, `?` optionality, string/number
 * literal unions (→ enum). JSDoc comments become descriptions; `@default`,
 * `@minimum`, `@maximum`, `@minLength`, `@maxLength`, `@pattern` tags become
 * constraints. Anything else is skipped with a warning. There are no secrets:
 * every value is public frontend config.
 *
 * @param {string} pluginDir - plugin root directory
 * @returns {{ schema: object | null, warnings: string[], registerExport: string | null }}
 */
function deriveConfigSchema(pluginDir) {
  const path = require("path");
  const fs = require("fs");
  const ts = require("typescript");

  const warnings = [];
  const srcDir = path.join(pluginDir, "src");
  if (!fs.existsSync(srcDir)) {
    return {
      schema: null,
      warnings: [`No src/ directory in ${pluginDir}`],
      registerExport: null,
    };
  }

  const entryFiles = collectSourceFiles(srcDir);
  if (entryFiles.length === 0) {
    return {
      schema: null,
      warnings: ["No TypeScript sources in src/"],
      registerExport: null,
    };
  }

  const program = ts.createProgram(entryFiles, {
    strict: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
    allowJs: false,
  });
  const checker = program.getTypeChecker();

  const found = findRegisterFunction(program, checker);
  if (!found) {
    return {
      schema: null,
      warnings: ["No exported register*Plugin function found"],
      registerExport: null,
    };
  }

  const properties = {};
  const required = [];
  for (const prop of getOptionsProperties(checker, found.paramType)) {
    const field = mapPropertyToField(checker, prop, warnings);
    if (!field) continue;
    properties[prop.name] = field;
    if (!prop.optional) required.push(prop.name);
  }

  return {
    schema: {
      type: "object",
      properties,
      required,
      additionalProperties: false,
    },
    warnings,
    registerExport: found.exportName,
  };
}

/**
 * @param {string} srcDir
 * @returns {string[]}
 */
function collectSourceFiles(srcDir) {
  const path = require("path");
  const fs = require("fs");
  const out = [];
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        visit(full);
      } else if (
        /\.(ts|tsx)$/.test(entry.name) &&
        !/\.test\.[jt]sx?$/.test(entry.name) &&
        !/\.spec\.[jt]sx?$/.test(entry.name) &&
        !/\.d\.ts$/.test(entry.name)
      ) {
        out.push(full);
      }
    }
  };
  visit(srcDir);
  return out;
}

/**
 * Find the exported register function, preferring an exact `registerPlugin`.
 * @param {import("typescript").Program} program
 * @param {import("typescript").TypeChecker} checker
 */
function findRegisterFunction(program, checker) {
  const ts = require("typescript");
  const candidates = [];
  for (const sourceFile of program.getSourceFiles()) {
    if (
      sourceFile.isDeclarationFile ||
      !sourceFile.fileName.includes("/src/")
    ) {
      continue;
    }
    ts.forEachChild(sourceFile, (node) => {
      const exportName = exportedFunctionName(node);
      if (exportName && /^register.*plugin$/i.test(exportName)) {
        candidates.push({ node, exportName, sourceFile });
      }
    });
  }
  if (candidates.length === 0) return null;
  const exact =
    candidates.find((c) => c.exportName === "registerPlugin") ?? candidates[0];
  const params = exact.node.parameters ?? [];
  if (params.length === 0 || !params[0].name) return null;
  const symbol = checker.getSymbolAtLocation(params[0].name);
  if (!symbol) return null;
  return {
    exportName: exact.exportName,
    paramType: checker.getTypeOfSymbolAtLocation(symbol, params[0]),
  };
}

/**
 * @param {import("typescript").Node} node
 * @returns {string | null} exported function name for declarations/exprs
 */
function exportedFunctionName(node) {
  const ts = require("typescript");
  const isExported = (modifiers) =>
    Array.isArray(modifiers) &&
    modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
  if (
    ts.isFunctionDeclaration(node) &&
    node.name &&
    isExported(node.modifiers)
  ) {
    return node.name.text;
  }
  if (
    ts.isVariableStatement(node) &&
    isExported(node.modifiers) &&
    node.declarationList.declarations.length === 1
  ) {
    const decl = node.declarationList.declarations[0];
    if (
      decl.name &&
      ts.isIdentifier(decl.name) &&
      decl.initializer &&
      (ts.isArrowFunction(decl.initializer) ||
        ts.isFunctionExpression(decl.initializer))
    ) {
      return decl.name.text;
    }
  }
  return null;
}

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {import("typescript").Type} type
 */
function getOptionsProperties(checker, type) {
  const ts = require("typescript");
  const target = type.isUnion()
    ? (type.types.find((t) => !(t.flags & ts.TypeFlags.Undefined)) ?? type)
    : type;
  return target.getProperties().map((symbol) => ({
    name: symbol.name,
    symbol,
    optional: (symbol.flags & ts.SymbolFlags.Optional) !== 0,
  }));
}

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {{ name: string, symbol: import("typescript").Symbol, optional: boolean }} prop
 * @param {string[]} warnings
 */
function mapPropertyToField(checker, prop, warnings) {
  const ts = require("typescript");
  const declarations = prop.symbol.getDeclarations() ?? [];
  const decl = declarations[0];
  const declaredType = decl
    ? checker.getTypeOfSymbolAtLocation(prop.symbol, decl)
    : checker.getDeclaredTypeOfSymbol(prop.symbol);
  // Optional props carry `| undefined` — strip it before mapping. Note: use
  // the stripped type as-is; getApparentType remaps intrinsics (e.g. string
  // becomes StringMapping) and breaks flag checks.
  const withoutUndefined = declaredType.isUnion()
    ? declaredType.types.filter(
        (t) =>
          !(t.flags & ts.TypeFlags.Undefined) && !(t.flags & ts.TypeFlags.Void),
      )
    : [declaredType];
  const type =
    withoutUndefined.length === 1 ? withoutUndefined[0] : declaredType;
  // Optional unions (`"a" | "b" | undefined`) keep `undefined` inside `type`.
  // Match union shapes against the members that remain after stripping it.
  const unionMembers = withoutUndefined.length > 1 ? withoutUndefined : null;
  const comment = ts.displayPartsToString(
    prop.symbol.getDocumentationComment(checker),
  );
  const tags = Object.fromEntries(
    prop.symbol.getJsDocTags().map((tag) => [tag.name, tag]),
  );
  const description = comment.trim() || undefined;
  const base = description ? { description } : {};

  const stringTag = (name) => {
    const tag = tags[name];
    if (!tag || !Array.isArray(tag.text)) return undefined;
    return (
      tag.text
        .map((p) => p.text)
        .join("")
        .trim() || undefined
    );
  };
  const numberTag = (name) => {
    const raw = stringTag(name);
    if (raw === undefined) return undefined;
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      warnings.push(`@${name} on "${prop.name}" is not a number, ignored`);
      return undefined;
    }
    return value;
  };

  if (type.flags & ts.TypeFlags.String) {
    const field = { type: "string", ...base };
    const minLength = numberTag("minLength");
    const maxLength = numberTag("maxLength");
    const pattern = stringTag("pattern");
    if (minLength !== undefined)
      field.minLength = Math.max(0, Math.floor(minLength));
    if (maxLength !== undefined)
      field.maxLength = Math.max(1, Math.floor(maxLength));
    if (pattern !== undefined) field.pattern = pattern;
    const def = stringTag("default");
    if (def !== undefined) field.default = def;
    return field;
  }
  if (type.flags & ts.TypeFlags.Number) {
    const field = { type: "number", ...base };
    const minimum = numberTag("minimum");
    const maximum = numberTag("maximum");
    if (minimum !== undefined) field.minimum = minimum;
    if (maximum !== undefined) field.maximum = maximum;
    const def = stringTag("default");
    if (def !== undefined) {
      const value = Number(def);
      if (Number.isFinite(value)) field.default = value;
    }
    return field;
  }
  if (type.flags & ts.TypeFlags.Boolean) {
    const field = { type: "boolean", ...base };
    const def = stringTag("default");
    if (def === "true") field.default = true;
    if (def === "false") field.default = false;
    return field;
  }
  if (unionMembers && unionMembers.every((t) => t.isStringLiteral())) {
    const field = {
      type: "string",
      ...base,
      enum: unionMembers.map((t) => t.value),
    };
    const def = stringTag("default");
    if (def !== undefined) field.default = def;
    return field;
  }
  if (unionMembers && unionMembers.every((t) => t.isNumberLiteral())) {
    const field = {
      type: "number",
      ...base,
      enum: unionMembers.map((t) => t.value),
    };
    return field;
  }
  if (
    unionMembers &&
    unionMembers.every((t) => t.flags & ts.TypeFlags.BooleanLiteral)
  ) {
    const field = { type: "boolean", ...base };
    const def = stringTag("default");
    if (def === "true") field.default = true;
    if (def === "false") field.default = false;
    return field;
  }

  warnings.push(
    `Option "${prop.name}" has an unsupported type and was skipped`,
  );
  return null;
}

module.exports = {
  MAX_CONFIG_SCHEMA_BYTES,
  validateConfigSchema,
  deriveConfigSchema,
  deriveInstallMetadata,
  findPinnedHostPeers,
  formatHostPeerSuggestions,
  formatRepositorySuggestion,
  isExactVersionRange,
  isHostProvidedPeer,
  normalizeGithubRepositoryUrl,
  readConfigSchemaFile,
  readManifestRepository,
  writeDerivedSchema,
};

/**
 * Write a derived schema to `configSchema.json`. Refuses to overwrite an
 * existing file so hand-tuned schemas are never clobbered. Also ensures the
 * file is published by adding it to `package.json` `files` when that
 * allow-list exists (without it, npm publishes everything by default).
 * @param {string} pluginDir
 * @param {object} schema
 * @returns {{ written: boolean, reason?: string, filesUpdated?: boolean }}
 */
function writeDerivedSchema(pluginDir, schema) {
  const path = require("path");
  const fs = require("fs");
  const file = path.join(pluginDir, "configSchema.json");
  if (fs.existsSync(file)) {
    return { written: false, reason: "configSchema.json already exists" };
  }
  fs.writeFileSync(file, `${JSON.stringify(schema, null, 2)}\n`);
  return { written: true, filesUpdated: ensurePublished(pluginDir) };
}

/**
 * @param {string} pluginDir
 * @returns {boolean} true when package.json was updated
 */
function ensurePublished(pluginDir) {
  const path = require("path");
  const fs = require("fs");
  const pkgFile = path.join(pluginDir, "package.json");
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
  } catch {
    return false;
  }
  if (!Array.isArray(pkg.files) || pkg.files.includes("configSchema.json")) {
    return false;
  }
  pkg.files.push("configSchema.json");
  fs.writeFileSync(pkgFile, `${JSON.stringify(pkg, null, 2)}\n`);
  return true;
}

/**
 * Derive publish-time install metadata from the local plugin source:
 * orderlyVersion (peer range), hasStyles (built CSS present), interceptor
 * slots (createInterceptor call sites), peer dependency requirements (the
 * runtime contract Orderly One fulfills on install) and the config schema
 * (checked-in `configSchema.json` when valid, otherwise derived from source).
 *
 * @param {string} pluginDir - plugin root directory
 * @returns {{
 *   orderlyVersion: string | null,
 *   hasStyles: boolean | null,
 *   registerExport: string | null,
 *   repositoryUrl: string | null,
 *   pinnedHostPeers: string[],
 *   slots: string[],
 *   configSchema: object | null,
 *   peerDependencies: Record<string, string>,
 *   devDependencies: Record<string, string>,
 *   warnings: string[],
 * }}
 */
function deriveInstallMetadata(pluginDir) {
  const path = require("path");
  const fs = require("fs");
  const warnings = [];

  const manifestPeers = readManifestPeers(pluginDir, warnings);
  const manifestRepository = readManifestRepository(pluginDir, warnings);
  const pinnedHostPeers = findPinnedHostPeers(manifestPeers.peerDependencies);
  if (pinnedHostPeers.length > 0) {
    warnings.push(
      `Host-provided peers are pinned to exact versions (Orderly One rejects exact pins on install): ${pinnedHostPeers.join(", ")}. Use a range like ">=3.0.0-beta.1" instead.`,
    );
  }
  const orderlyVersion = deriveOrderlyVersion(
    manifestPeers.peerDependencies,
    warnings,
  );
  const hasStyles = probeBuiltStyles(pluginDir);
  const slots = scanInterceptorSlots(pluginDir);

  let configSchema = readCheckedInSchema(pluginDir, warnings);
  const derived = deriveConfigSchema(pluginDir);
  const registerExport = derived.registerExport;
  if (!configSchema) {
    warnings.push(...derived.warnings);
    configSchema = derived.schema;
  }

  return {
    orderlyVersion,
    hasStyles,
    registerExport,
    repositoryUrl: manifestRepository.repositoryUrl,
    pinnedHostPeers,
    slots,
    configSchema,
    peerDependencies: manifestPeers.peerDependencies,
    devDependencies: manifestPeers.devDependencies,
    warnings,
  };
}

/**
 * Normalizes an npm `repository` value to the canonical GitHub URL the
 * Marketplace compares against. Mirrors the server's implementation so the CLI
 * and the submission check agree on what "matches" means:
 *   git+https://github.com/Owner/Repo.git -> https://github.com/owner/repo
 *   git@github.com:Owner/Repo.git        -> https://github.com/owner/repo
 * @param {string} value
 * @returns {string | null}
 */
function normalizeGithubRepositoryUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().replace(/^git\+/, "");
  const ssh = trimmed.match(/^git@github\.com:([^/]+)\/([^/#]+?)(?:\.git)?$/i);
  if (ssh) {
    return `https://github.com/${ssh[1].toLowerCase()}/${ssh[2].toLowerCase()}`;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.hostname.toLowerCase() !== "github.com") return null;
    const match = parsed.pathname.match(/^\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/);
    return match
      ? `https://github.com/${match[1].toLowerCase()}/${match[2].toLowerCase()}`
      : null;
  } catch {
    return null;
  }
}

/**
 * The package.json snippet an author should add, using the repo URL when one
 * is known (manifest/git remote) or a placeholder otherwise. Kept next to the
 * repository check so every surface suggests the same shape.
 * @param {string | null | undefined} repoUrl
 * @returns {string} e.g. `"repository": "git+https://github.com/owner/repo.git"`
 */
function formatRepositorySuggestion(repoUrl) {
  let value = typeof repoUrl === "string" ? repoUrl.trim() : "";
  if (value.startsWith("github.com/")) value = `https://${value}`;
  const normalized = normalizeGithubRepositoryUrl(
    value.replace(/\/$/, "").replace(/\.git$/, ""),
  );
  if (normalized) {
    return `"repository": "git+${normalized}.git"`;
  }
  return '"repository": "git+https://github.com/<owner>/<repo>.git"';
}

/**
 * Host-provided packages: Orderly One supplies them at its own SDK version, so
 * a plugin must accept the host's version rather than pin one.
 * @param {string} name
 * @returns {boolean}
 */
function isHostProvidedPeer(name) {
  return (
    name === "react" ||
    name === "react-dom" ||
    name.startsWith("react/") ||
    name.startsWith("react-dom/") ||
    name.startsWith("@orderly.network/")
  );
}

/**
 * True for exact versions (`3.0.4-alpha.2`, `=3.0.4`, `v3.0.4`) as opposed to
 * ranges (`>=3.0.0`, `^3.0.0`, `3.0.x`, `*`). Exact pins on host-provided
 * peers make the deploy merge fail closed on any DEX whose SDK differs.
 * @param {string} range
 * @returns {boolean}
 */
function isExactVersionRange(range) {
  if (typeof range !== "string") return false;
  const value = range.trim().replace(/^[=v]+/, "");
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value);
}

/**
 * Host-provided peers that are pinned to an exact version, e.g.
 * `["@orderly.network/ui@3.0.4-alpha.2"]`. Non-empty means the plugin cannot
 * install on Orderly One until the pins become ranges.
 * @param {Record<string, string>} peerDependencies
 * @returns {string[]}
 */
function findPinnedHostPeers(peerDependencies) {
  return Object.entries(peerDependencies ?? {})
    .filter(
      ([name, range]) => isHostProvidedPeer(name) && isExactVersionRange(range),
    )
    .map(([name, range]) => `${name}@${range}`);
}

/**
 * JSON lines suggesting a range for each pinned host peer, for error output.
 * @param {string[]} pinnedHostPeers e.g. `["@orderly.network/ui@3.0.4-alpha.2"]`
 * @returns {string[]}
 */
function formatHostPeerSuggestions(pinnedHostPeers) {
  return (pinnedHostPeers ?? []).map((entry) => {
    const at = entry.lastIndexOf("@");
    const name = at > 0 ? entry.slice(0, at) : entry;
    return `  "${name}": ">=3.0.0-beta.1",`;
  });
}

/**
 * The package's declared GitHub repository. The Marketplace requires the
 * published npm package to declare it (`repository` in package.json), and the
 * submission check compares it to the GitHub repository being submitted —
 * catch it here instead of failing after a publish.
 * @param {string} pluginDir
 * @param {string[]} warnings
 * @returns {{ repositoryUrl: string | null, repositoryRaw: string | null }}
 */
function readManifestRepository(pluginDir, warnings) {
  const path = require("path");
  const fs = require("fs");
  let pkg;
  try {
    pkg = JSON.parse(
      fs.readFileSync(path.join(pluginDir, "package.json"), "utf-8"),
    );
  } catch {
    // readManifestPeers already warns about the unreadable manifest.
    return { repositoryUrl: null, repositoryRaw: null };
  }
  const raw =
    typeof pkg.repository === "string"
      ? pkg.repository
      : typeof pkg.repository?.url === "string"
        ? pkg.repository.url
        : null;
  if (!raw || !raw.trim()) {
    warnings.push(
      `package.json has no repository field — npm submissions require it; add ${formatRepositorySuggestion(null)}`,
    );
    return { repositoryUrl: null, repositoryRaw: null };
  }
  const repositoryUrl = normalizeGithubRepositoryUrl(raw);
  if (!repositoryUrl) {
    warnings.push(`package.json repository is not a GitHub URL: ${raw.trim()}`);
  }
  return { repositoryUrl, repositoryRaw: raw.trim() };
}

/**
 * Non-optional `peerDependencies` and the devDependency ranges for those same
 * packages (what the author built against; the server prefers these when
 * pinning installable versions). Optional peers are skipped.
 * @param {string} pluginDir
 * @param {string[]} warnings
 * @returns {{ peerDependencies: Record<string, string>, devDependencies: Record<string, string> }}
 */
function readManifestPeers(pluginDir, warnings) {
  const path = require("path");
  const fs = require("fs");
  let pkg;
  try {
    pkg = JSON.parse(
      fs.readFileSync(path.join(pluginDir, "package.json"), "utf-8"),
    );
  } catch {
    warnings.push("package.json is missing or invalid");
    return { peerDependencies: {}, devDependencies: {} };
  }
  const meta = pkg.peerDependenciesMeta ?? {};
  const peerDependencies = {};
  for (const [name, range] of Object.entries(pkg.peerDependencies ?? {})) {
    if (typeof range !== "string" || !range.trim() || range.length > 100) {
      continue;
    }
    if (meta[name]?.optional === true) continue;
    peerDependencies[name] = range.trim();
  }
  const dev = pkg.devDependencies ?? {};
  const devDependencies = {};
  for (const name of Object.keys(peerDependencies)) {
    const value = dev[name];
    if (typeof value === "string" && value.trim() && value.length <= 100) {
      devDependencies[name] = value.trim();
    }
  }
  return { peerDependencies, devDependencies };
}

/**
 * @param {Record<string, string>} peers
 * @param {string[]} warnings
 * @returns {string | null}
 */
function deriveOrderlyVersion(peers, warnings) {
  const candidates = Object.entries(peers).filter(([name]) =>
    name.startsWith("@orderly.network/"),
  );
  if (candidates.length === 0) {
    warnings.push("No @orderly.network peer dependencies found");
    return null;
  }
  const core = candidates.find(
    ([name]) => name === "@orderly.network/plugin-core",
  );
  const [, range] = core ?? candidates[0];
  if (typeof range !== "string" || range.length > 60) {
    warnings.push("Unparseable @orderly.network peer range");
    return null;
  }
  return range;
}

/**
 * @param {string} pluginDir
 * @returns {boolean | null} true when built CSS exists, null when unknown
 */
function probeBuiltStyles(pluginDir) {
  const path = require("path");
  const fs = require("fs");
  if (!fs.existsSync(path.join(pluginDir, "dist"))) {
    return null;
  }
  return fs.existsSync(path.join(pluginDir, "dist", "styles.css"));
}

/**
 * @param {string} pluginDir
 * @returns {string[]} interceptor slot paths from createInterceptor calls
 */
function scanInterceptorSlots(pluginDir) {
  const path = require("path");
  const fs = require("fs");
  const srcDir = path.join(pluginDir, "src");
  if (!fs.existsSync(srcDir)) return [];
  const slots = new Set();
  const visit = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        visit(full);
      } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf-8");
        for (const match of text.matchAll(
          /createInterceptor\(\s*["'`]([^"'`]+)["'`]/g,
        )) {
          slots.add(match[1]);
        }
      }
    }
  };
  visit(srcDir);
  return [...slots].sort();
}

/**
 * Read and validate a checked-in `configSchema.json`.
 * @param {string} pluginDir
 * @returns {{ status: "missing" | "valid" | "invalid", schema?: object, errors?: string[] }}
 */
function readConfigSchemaFile(pluginDir) {
  const path = require("path");
  const fs = require("fs");
  const file = path.join(pluginDir, "configSchema.json");
  if (!fs.existsSync(file)) return { status: "missing" };
  let raw;
  try {
    raw = fs.readFileSync(file, "utf-8");
  } catch {
    return { status: "invalid", errors: ["configSchema.json is unreadable"] };
  }
  if (raw.length > MAX_CONFIG_SCHEMA_BYTES) {
    return { status: "invalid", errors: ["configSchema.json exceeds 32KB"] };
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      status: "invalid",
      errors: ["configSchema.json is not valid JSON"],
    };
  }
  const { valid, errors } = validateConfigSchema(parsed);
  if (!valid) return { status: "invalid", errors };
  return { status: "valid", schema: parsed };
}

/**
 * @param {string} pluginDir
 * @param {string[]} warnings
 * @returns {object | null}
 */
function readCheckedInSchema(pluginDir, warnings) {
  const result = readConfigSchemaFile(pluginDir);
  if (result.status === "missing") return null;
  if (result.status === "invalid") {
    warnings.push(`configSchema.json is invalid: ${result.errors[0]}`);
    return null;
  }
  return result.schema;
}
