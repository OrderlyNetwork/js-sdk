const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const {
  scanBareImports,
  collectBundleFiles,
  checkPluginBundle,
  formatRuntimePluginWarning,
} = require("./pluginBundleCheck");

function makePlugin(packageJson, files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-bundle-"));
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(packageJson));
  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(dir, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
  return dir;
}

describe("scanBareImports", () => {
  it("collects bare specifiers and ignores relative, builtin and url ones", () => {
    const source = [
      'import x from "@scope/pkg";',
      'import "@scope/side-effect";',
      'export { y } from "zustand";',
      'const z = await import("@solana/web3.js");',
      'import local from "./local.js";',
      'import abs from "/abs.js";',
      'import n from "node:fs";',
      'import u from "https://esm.sh/x";',
    ].join("\n");
    assert.deepEqual(scanBareImports(source).sort(), [
      "@scope/pkg",
      "@scope/side-effect",
      "@solana/web3.js",
      "zustand",
    ]);
  });

  it("ignores keywords inside string literals (bundled header lists)", () => {
    assert.deepEqual(
      scanBareImports('const h = ["from", "etag", "expires", "host"];'),
      [],
    );
    assert.deepEqual(
      scanBareImports('X = ["from", "etag"]; import { a } from "zustand";'),
      ["zustand"],
    );
  });
});

describe("checkPluginBundle", () => {
  it("flags packages the host does not provide", () => {
    const dir = makePlugin(
      { name: "@scope/demo", files: ["dist"] },
      {
        "dist/index.js": [
          'import { a } from "react";',
          'import { b } from "@orderly.network/ui";',
          'import { c } from "@solana/web3.js";',
          'import { d } from "@defuse-protocol/one-click-sdk-typescript";',
        ].join("\n"),
      },
    );
    const result = checkPluginBundle(dir);
    assert.deepEqual(result.unexpected, [
      "@defuse-protocol/one-click-sdk-typescript",
      "@solana/web3.js",
    ]);
    assert.equal(result.filesChecked, 1);
  });

  it("stays quiet for a self-contained bundle", () => {
    const dir = makePlugin(
      { name: "@scope/demo", files: ["dist"] },
      {
        "dist/index.js": [
          'import { a } from "react";',
          'import { b } from "react/jsx-runtime";',
          'import { c } from "@orderly.network/plugin-core";',
        ].join("\n"),
      },
    );
    assert.deepEqual(checkPluginBundle(dir).unexpected, []);
  });

  it("only scans published files when package.json has a files allow-list", () => {
    const dir = makePlugin(
      { name: "@scope/demo", files: ["dist"] },
      {
        "dist/index.js": 'import { a } from "react";',
        "src/extra.js": 'import { c } from "@solana/web3.js";',
      },
    );
    assert.deepEqual(checkPluginBundle(dir).unexpected, []);
    assert.ok(!collectBundleFiles(dir).some((f) => f.includes("src/extra.js")));
  });

  it("scans the whole tree when there is no files allow-list", () => {
    const dir = makePlugin(
      { name: "@scope/demo" },
      { "lib/index.js": 'import { c } from "zustand";' },
    );
    assert.deepEqual(checkPluginBundle(dir).unexpected, ["zustand"]);
  });

  it("ignores non-JS entries in a files allow-list (LICENSE, README)", () => {
    const dir = makePlugin(
      { name: "@scope/demo", files: ["dist", "LICENSE", "README.md"] },
      {
        "dist/index.js": 'import { c } from "zustand";',
        LICENSE: "MIT",
        "README.md": "# demo",
      },
    );
    assert.deepEqual(checkPluginBundle(dir).unexpected, ["zustand"]);
  });
});

describe("formatRuntimePluginWarning", () => {
  it("names the packages and keeps the door open for non-Orderly-One hosts", () => {
    const message = formatRuntimePluginWarning(["@solana/web3.js"]);
    assert.match(message, /cannot be installed as a runtime plugin/);
    assert.match(message, /@solana\/web3\.js/);
    assert.match(message, /not blocked/);
  });
});
