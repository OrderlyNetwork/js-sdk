const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const { deriveInstallMetadata } = require("./pluginConfigSchema");

function makePlugin(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-meta-"));
  for (const [name, content] of Object.entries(files)) {
    const full = path.join(dir, name);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content);
  }
  return dir;
}

const registerSource = `
export interface DemoOptions {
  /** Display name. */
  name?: string;
}
export function registerDemoPlugin(options: DemoOptions = {}) {
  return (_sdk: unknown) => {};
}
export const extra = 1;
`;

const optionalOptionsSource = `
export interface DemoOptions {
  /**
   * Hide the default brand.
   * @default false
   */
  hideLogo?: boolean;
  /**
   * Enable authorization.
   * @default true
   */
  tradingAuthorization?: boolean;
  /** Target network. */
  networkId?: "mainnet" | "testnet";
  /**
   * Button z-index.
   * @default 9998
   * @minimum 0
   */
  buttonZIndex?: number;
  /** Unsupported mixed union. */
  mixed?: string | number;
  /** Unsupported callback. */
  onReady?: () => void;
}
export function registerDemoPlugin(options: DemoOptions = {}) {
  return (_sdk: unknown) => {};
}
`;

describe("deriveInstallMetadata", () => {
  it("derives version, styles, slots and schema from source", () => {
    const dir = makePlugin({
      "package.json": JSON.stringify({
        name: "@scope/demo",
        repository: "https://github.com/scope/demo.git",
        peerDependencies: {
          "@orderly.network/plugin-core": ">=3.0.0",
          react: ">=18",
          zustand: ">=4.5.0",
          "optional-peer": ">=1.0.0",
        },
        peerDependenciesMeta: { "optional-peer": { optional: true } },
        devDependencies: { zustand: "^4.5.0" },
      }),
      "src/plugin.ts": registerSource,
      "src/widget.ts": `createInterceptor("Deposit.DepositForm", () => null);`,
      "dist/styles.css": ".x{}",
    });
    const meta = deriveInstallMetadata(dir);
    assert.equal(meta.orderlyVersion, ">=3.0.0");
    assert.equal(meta.hasStyles, true);
    assert.equal(meta.registerExport, "registerDemoPlugin");
    assert.deepEqual(meta.slots, ["Deposit.DepositForm"]);
    assert.ok(meta.configSchema);
    assert.deepEqual(meta.configSchema.properties.name, {
      type: "string",
      description: "Display name.",
    });
    assert.deepEqual(meta.peerDependencies, {
      "@orderly.network/plugin-core": ">=3.0.0",
      react: ">=18",
      zustand: ">=4.5.0",
    });
    assert.deepEqual(meta.devDependencies, { zustand: "^4.5.0" });
    assert.deepEqual(meta.warnings, []);
  });

  it("prefers a valid checked-in schema and reports unknown styles", () => {
    const dir = makePlugin({
      "package.json": JSON.stringify({ name: "@scope/demo" }),
      "src/plugin.ts": registerSource,
      "configSchema.json": JSON.stringify({
        type: "object",
        properties: { name: { type: "string" } },
        required: [],
        additionalProperties: false,
      }),
    });
    const meta = deriveInstallMetadata(dir);
    assert.deepEqual(Object.keys(meta.configSchema.properties), ["name"]);
    assert.equal(meta.hasStyles, null);
    assert.equal(meta.orderlyVersion, null);
    assert.ok(meta.warnings.some((w) => w.includes("peer dependencies")));
  });

  it("ignores invalid checked-in schemas and falls back to derivation", () => {
    const dir = makePlugin({
      "package.json": JSON.stringify({ name: "@scope/demo" }),
      "src/plugin.ts": registerSource,
      "configSchema.json": JSON.stringify({
        type: "object",
        properties: { name: { type: "object" } },
      }),
    });
    const meta = deriveInstallMetadata(dir);
    assert.deepEqual(Object.keys(meta.configSchema.properties), ["name"]);
    assert.ok(meta.warnings.some((w) => w.includes("configSchema.json")));
  });

  it("derives optional booleans and string-literal unions", () => {
    const dir = makePlugin({
      "package.json": JSON.stringify({ name: "@scope/demo" }),
      "src/plugin.ts": optionalOptionsSource,
    });
    const meta = deriveInstallMetadata(dir);
    const props = meta.configSchema.properties;

    assert.deepEqual(props.hideLogo, {
      type: "boolean",
      description: "Hide the default brand.",
      default: false,
    });
    assert.deepEqual(props.tradingAuthorization, {
      type: "boolean",
      description: "Enable authorization.",
      default: true,
    });
    assert.deepEqual(props.networkId, {
      type: "string",
      description: "Target network.",
      enum: ["mainnet", "testnet"],
    });
    assert.deepEqual(props.buttonZIndex, {
      type: "number",
      description: "Button z-index.",
      default: 9998,
      minimum: 0,
    });

    assert.ok(
      meta.warnings.some((w) => w.includes('Option "mixed"')),
      "mixed union should be reported",
    );
    assert.ok(
      meta.warnings.some((w) => w.includes('Option "onReady"')),
      "callback should be reported",
    );
    for (const derived of ["hideLogo", "tradingAuthorization", "networkId"]) {
      assert.ok(
        !meta.warnings.some((w) => w.includes(`Option "${derived}"`)),
        `${derived} should not be reported as unsupported`,
      );
    }
  });
});
