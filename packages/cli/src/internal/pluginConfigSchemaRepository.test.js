const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const {
  deriveInstallMetadata,
  formatRepositorySuggestion,
  normalizeGithubRepositoryUrl,
  readManifestRepository,
} = require("./pluginConfigSchema");

function makePlugin(packageJson) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "plugin-repo-"));
  fs.mkdirSync(path.join(dir, "dist"), { recursive: true });
  fs.writeFileSync(path.join(dir, "dist", "index.js"), "module.exports = {};");
  fs.writeFileSync(
    path.join(dir, "package.json"),
    typeof packageJson === "string" ? packageJson : JSON.stringify(packageJson),
  );
  return dir;
}

describe("normalizeGithubRepositoryUrl", () => {
  it("normalizes the documented npm forms to the canonical URL", () => {
    for (const value of [
      "https://github.com/Tarnadas/orderbook-shimmer-plugin",
      "https://github.com/Tarnadas/orderbook-shimmer-plugin.git",
      "git+https://github.com/Tarnadas/orderbook-shimmer-plugin.git",
      "git@github.com:Tarnadas/orderbook-shimmer-plugin.git",
      "https://github.com/Tarnadas/orderbook-shimmer-plugin/",
    ]) {
      assert.equal(
        normalizeGithubRepositoryUrl(value),
        "https://github.com/tarnadas/orderbook-shimmer-plugin",
        value,
      );
    }
  });

  it("rejects non-GitHub and malformed values", () => {
    for (const value of [
      "",
      "not a url",
      "https://gitlab.com/owner/repo",
      "https://github.com/only-owner",
    ]) {
      assert.equal(normalizeGithubRepositoryUrl(value), null, value);
    }
  });
});

describe("readManifestRepository", () => {
  it("reads the string and object forms", () => {
    const stringForm = readManifestRepository(
      makePlugin({
        name: "demo",
        repository: "https://github.com/owner/repo.git",
      }),
      [],
    );
    assert.equal(stringForm.repositoryUrl, "https://github.com/owner/repo");
    assert.equal(stringForm.repositoryRaw, "https://github.com/owner/repo.git");

    const objectForm = readManifestRepository(
      makePlugin({
        name: "demo",
        repository: {
          type: "git",
          url: "git+https://github.com/Owner/Repo.git",
        },
      }),
      [],
    );
    assert.equal(objectForm.repositoryUrl, "https://github.com/owner/repo");
  });

  it("warns when the repository field is missing", () => {
    const warnings = [];
    const result = readManifestRepository(
      makePlugin({ name: "demo" }),
      warnings,
    );
    assert.equal(result.repositoryUrl, null);
    assert.equal(result.repositoryRaw, null);
    assert.ok(
      warnings.some((w) => w.includes("has no repository field")),
      warnings.join("\n"),
    );
  });

  it("warns when the repository is not a GitHub URL", () => {
    const warnings = [];
    const result = readManifestRepository(
      makePlugin({ name: "demo", repository: "https://gitlab.com/o/r" }),
      warnings,
    );
    assert.equal(result.repositoryUrl, null);
    assert.equal(result.repositoryRaw, "https://gitlab.com/o/r");
    assert.ok(
      warnings.some((w) => w.includes("is not a GitHub URL")),
      warnings.join("\n"),
    );
  });

  it("stays silent when the manifest itself is unreadable", () => {
    const warnings = [];
    const result = readManifestRepository(makePlugin("{ not json"), warnings);
    assert.equal(result.repositoryUrl, null);
    // readManifestPeers reports the unreadable manifest; avoid a duplicate.
    assert.deepEqual(warnings, []);
  });
});

describe("formatRepositorySuggestion", () => {
  it("suggests the concrete snippet from a known repo URL", () => {
    assert.equal(
      formatRepositorySuggestion(
        "https://github.com/Tarnadas/orderbook-shimmer-plugin",
      ),
      '"repository": "git+https://github.com/tarnadas/orderbook-shimmer-plugin.git"',
    );
  });

  it("accepts scheme-less SSH-derived URLs and .git suffixes", () => {
    assert.equal(
      formatRepositorySuggestion(
        "github.com/Tarnadas/orderbook-shimmer-plugin.git",
      ),
      '"repository": "git+https://github.com/tarnadas/orderbook-shimmer-plugin.git"',
    );
  });

  it("falls back to a placeholder when there is no usable URL", () => {
    for (const value of [null, undefined, "", "https://gitlab.com/o/r"]) {
      assert.equal(
        formatRepositorySuggestion(value),
        '"repository": "git+https://github.com/<owner>/<repo>.git"',
        String(value),
      );
    }
  });
});

describe("deriveInstallMetadata repository surfacing", () => {
  it("includes the normalized repository URL", () => {
    const meta = deriveInstallMetadata(
      makePlugin({
        name: "@scope/demo",
        repository: "git+https://github.com/Owner/Repo.git",
        peerDependencies: { "@orderly.network/plugin-core": ">=3.0.0" },
      }),
    );
    assert.equal(meta.repositoryUrl, "https://github.com/owner/repo");
    assert.ok(
      !meta.warnings.some((w) => w.includes("has no repository field")),
      meta.warnings.join("\n"),
    );
  });
});
