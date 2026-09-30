const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const {
  deriveInstallMetadata,
  findPinnedHostPeers,
  formatHostPeerSuggestions,
  isExactVersionRange,
  isHostProvidedPeer,
} = require("./pluginConfigSchema");

function makePlugin(packageJson) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-pins-"));
  fs.mkdirSync(path.join(dir, "dist"), { recursive: true });
  fs.writeFileSync(path.join(dir, "dist", "index.js"), "module.exports = {};");
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(packageJson));
  return dir;
}

describe("isExactVersionRange", () => {
  it("recognizes exact versions, including npm spellings", () => {
    for (const value of [
      "3.0.4-alpha.2",
      "1.2.3",
      "=3.0.4",
      "v3.0.4",
      "1.2.3+build.7",
    ]) {
      assert.equal(isExactVersionRange(value), true, value);
    }
  });

  it("treats ranges and tags as non-exact", () => {
    for (const value of [
      ">=3.0.0-beta.1",
      "^3.0.0",
      "~3.0.4",
      "3.0.x",
      "3.x",
      "*",
      "latest",
      "18 || 19",
      "",
    ]) {
      assert.equal(isExactVersionRange(value), false, value);
    }
  });
});

describe("isHostProvidedPeer", () => {
  it("matches what Orderly One supplies at build time", () => {
    for (const name of [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "@orderly.network/ui",
      "@orderly.network/trading-next",
    ]) {
      assert.equal(isHostProvidedPeer(name), true, name);
    }
    for (const name of ["zustand", "@solana/web3.js", "@scope/pkg"]) {
      assert.equal(isHostProvidedPeer(name), false, name);
    }
  });
});

describe("findPinnedHostPeers", () => {
  it("flags exact host peers and ignores third-party pins", () => {
    assert.deepEqual(
      findPinnedHostPeers({
        "@orderly.network/ui": "3.0.4-alpha.2",
        react: "18.2.0",
        zustand: "4.5.7",
        "@solana/web3.js": "1.98.4",
        "@orderly.network/hooks": ">=3.0.0-beta.1",
      }),
      ["@orderly.network/ui@3.0.4-alpha.2", "react@18.2.0"],
    );
  });

  it("returns nothing for range-based manifests", () => {
    assert.deepEqual(
      findPinnedHostPeers({
        "@orderly.network/ui": ">=3.0.0-beta.1",
        react: ">=18",
      }),
      [],
    );
  });
});

describe("formatHostPeerSuggestions", () => {
  it("keeps scoped names intact and suggests a range", () => {
    assert.deepEqual(
      formatHostPeerSuggestions([
        "@orderly.network/trading-next@3.0.4-alpha.2",
        "react@18.2.0",
      ]),
      [
        '  "@orderly.network/trading-next": ">=3.0.0-beta.1",',
        '  "react": ">=3.0.0-beta.1",',
      ],
    );
  });
});

describe("deriveInstallMetadata host peer pins", () => {
  it("reports pinned host peers and warns", () => {
    const meta = deriveInstallMetadata(
      makePlugin({
        name: "@scope/demo",
        repository: "https://github.com/scope/demo",
        peerDependencies: {
          "@orderly.network/ui": "3.0.4-alpha.2",
          "@orderly.network/plugin-core": "3.0.4-alpha.2",
          zustand: "4.5.7",
        },
      }),
    );
    assert.deepEqual(meta.pinnedHostPeers, [
      "@orderly.network/ui@3.0.4-alpha.2",
      "@orderly.network/plugin-core@3.0.4-alpha.2",
    ]);
    assert.ok(
      meta.warnings.some((w) => w.includes("pinned to exact versions")),
      meta.warnings.join("\n"),
    );
  });

  it("stays quiet for range-based host peers", () => {
    const meta = deriveInstallMetadata(
      makePlugin({
        name: "@scope/demo",
        repository: "https://github.com/scope/demo",
        peerDependencies: {
          "@orderly.network/ui": ">=3.0.0-beta.1",
          zustand: "4.5.7",
        },
      }),
    );
    assert.deepEqual(meta.pinnedHostPeers, []);
    assert.ok(
      !meta.warnings.some((w) => w.includes("pinned to exact versions")),
      meta.warnings.join("\n"),
    );
  });
});
