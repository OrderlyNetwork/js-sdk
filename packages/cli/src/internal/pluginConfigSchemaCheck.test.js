const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const {
  checkConfigSchema,
  deriveConfigSchema,
  diffConfigSchemas,
  writeDerivedSchema,
} = require("./pluginConfigSchema");

function makePlugin(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-check-"));
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

const registerSource = `
export interface DemoOptions {
  /** Fee in bps. */
  fee?: number;
  /** Target network. */
  networkId?: "mainnet" | "testnet";
}
export function registerDemoPlugin(options: DemoOptions = {}) {
  return (_sdk: unknown) => {};
}
`;

const noRegisterSource = `export const extra = 1;`;

function pluginWithSchema(schema) {
  return makePlugin({
    "package.json": JSON.stringify({ name: "@scope/demo" }),
    "src/plugin.ts": registerSource,
    "configSchema.json": JSON.stringify(schema),
  });
}

describe("diffConfigSchemas", () => {
  it("is empty for equal schemas regardless of key order", () => {
    const diffs = diffConfigSchemas(
      { required: [], properties: { b: { type: "string" } } },
      { properties: { b: { type: "string" } }, required: [] },
    );
    assert.deepEqual(diffs, []);
  });

  it("diffs arrays element-wise", () => {
    const diffs = diffConfigSchemas(
      { required: ["a", "b"] },
      { required: ["b"] },
    );
    assert.deepEqual(diffs, [
      'required[0]: has "a", derived "b"',
      "required[1]: not derived from source (extra in configSchema.json)",
    ]);
  });

  it("reports missing, changed and extra properties", () => {
    const diffs = diffConfigSchemas(
      {
        properties: { fee: { type: "number", default: 10 } },
        required: [],
      },
      {
        properties: {
          fee: { type: "number" },
          networkId: { type: "string" },
        },
        required: [],
      },
    );
    assert.deepEqual(diffs, [
      "properties.fee.default: not derived from source (extra in configSchema.json)",
      'properties.networkId: missing from configSchema.json (derived: {"type":"string"})',
    ]);
  });
});

describe("checkConfigSchema", () => {
  it("matches a checked-in schema generated from the same source", () => {
    const derived = deriveConfigSchema(
      makePlugin({
        "src/plugin.ts": registerSource,
      }),
    );
    const result = checkConfigSchema(pluginWithSchema(derived.schema));
    assert.equal(result.status, "match");
    assert.deepEqual(result.diffs, []);
    assert.deepEqual(result.errors, []);
  });

  it("reports drift with property-level diffs", () => {
    const result = checkConfigSchema(
      pluginWithSchema({
        type: "object",
        properties: {
          fee: { type: "number", description: "Fee in bps.", default: 10 },
          legacy: { type: "string" },
        },
        required: [],
        additionalProperties: false,
      }),
    );
    assert.equal(result.status, "drift");
    assert.deepEqual(result.diffs, [
      "properties.fee.default: not derived from source (extra in configSchema.json)",
      'properties.networkId: missing from configSchema.json (derived: {"type":"string","description":"Target network.","enum":["mainnet","testnet"]})',
      "properties.legacy: not derived from source (extra in configSchema.json)",
    ]);
  });

  it("reports a missing schema file with the options it would contain", () => {
    const dir = makePlugin({
      "package.json": JSON.stringify({ name: "@scope/demo" }),
      "src/plugin.ts": registerSource,
    });
    const result = checkConfigSchema(dir);
    assert.equal(result.status, "missing");
    assert.deepEqual(result.diffs, [
      "properties.fee: missing from configSchema.json",
      "properties.networkId: missing from configSchema.json",
    ]);
  });

  it("reports an invalid checked-in schema", () => {
    const result = checkConfigSchema(
      pluginWithSchema({
        type: "object",
        properties: { fee: { type: "object" } },
      }),
    );
    assert.equal(result.status, "invalid");
    assert.ok(result.errors.length > 0);
  });

  it("reports no-options when source has nothing to derive", () => {
    const dir = makePlugin({
      "package.json": JSON.stringify({ name: "@scope/demo" }),
      "src/plugin.ts": noRegisterSource,
    });
    assert.equal(checkConfigSchema(dir).status, "no-options");
  });

  it("reports unavailable for an unverifiable hand-written schema", () => {
    const dir = makePlugin({
      "package.json": JSON.stringify({ name: "@scope/demo" }),
      "src/plugin.ts": noRegisterSource,
      "configSchema.json": JSON.stringify({
        type: "object",
        properties: { manual: { type: "string" } },
        required: [],
        additionalProperties: false,
      }),
    });
    const result = checkConfigSchema(dir);
    assert.equal(result.status, "unavailable");
    assert.ok(result.warnings.length > 0);
  });
});

describe("writeDerivedSchema --force", () => {
  const schema = {
    type: "object",
    properties: { fee: { type: "number" } },
    required: [],
    additionalProperties: false,
  };

  it("refuses to overwrite without force", () => {
    const dir = pluginWithSchema({
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    });
    const result = writeDerivedSchema(dir, schema);
    assert.equal(result.written, false);
    assert.equal(result.reason, "configSchema.json already exists");
  });

  it("overwrites with force and keeps the file published", () => {
    const dir = pluginWithSchema({
      type: "object",
      properties: {},
      required: [],
      additionalProperties: false,
    });
    fs.writeFileSync(
      path.join(dir, "package.json"),
      JSON.stringify({ name: "@scope/demo", files: ["dist"] }),
    );
    const result = writeDerivedSchema(dir, schema, { force: true });
    assert.equal(result.written, true);
    assert.equal(result.filesUpdated, true);
    assert.deepEqual(
      JSON.parse(fs.readFileSync(path.join(dir, "configSchema.json"), "utf-8")),
      schema,
    );
    assert.deepEqual(
      JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf-8"))
        .files,
      ["dist", "configSchema.json"],
    );
  });
});
