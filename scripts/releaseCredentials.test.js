const assert = require("node:assert/strict");
const { execFile } = require("node:child_process");
const { access, mkdtemp, readFile, rm, stat } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");
const { promisify } = require("node:util");
const { afterEach, describe, test } = require("node:test");

const {
  createSafeHttpsRemoteUrl,
  redactSecrets,
  withGitAskPass,
  withNpmAuth,
} = require("./releaseCredentials");

const execFileAsync = promisify(execFile);
const temporaryRoots = [];

describe("release credentials", () => {
  afterEach(async () => {
    await Promise.all(
      temporaryRoots.splice(0).map((directory) =>
        rm(directory, {
          recursive: true,
          force: true,
        }),
      ),
    );
  });

  test("uses a placeholder-only temporary npmrc and leaves project npmrc unchanged", async () => {
    const token = "npm-secret-token";
    const tempRoot = await createTemporaryRoot();
    const projectNpmrc = path.resolve(".npmrc");
    const originalProjectNpmrc = await readFile(projectNpmrc, "utf8");
    let configPath;

    await withNpmAuth(
      {
        registry: "https://npm.example.com/custom/",
        token,
        env: { PATH: process.env.PATH },
        tempRoot,
      },
      async (context) => {
        configPath = context.configPath;
        const content = await readFile(configPath, "utf8");
        const fileStat = await stat(configPath);

        assert.equal(
          content,
          "//npm.example.com/custom/:_authToken=${NPM_TOKEN}\n",
        );
        assert.doesNotMatch(content, new RegExp(token));
        assert.equal(fileStat.mode & 0o777, 0o600);
        assert.equal(context.env.NPM_TOKEN, token);
        assert.equal(context.env.NPM_CONFIG_USERCONFIG, configPath);
        assert.equal(
          context.env.NPM_CONFIG_REGISTRY,
          "https://npm.example.com/custom/",
        );
        // @changesets/cli reads the lowercase key on Linux CI.
        assert.equal(
          context.env.npm_config_registry,
          "https://npm.example.com/custom/",
        );
        assert.notEqual(configPath, projectNpmrc);
      },
    );

    await assertPathMissing(configPath);
    assert.equal(await readFile(projectNpmrc, "utf8"), originalProjectNpmrc);
  });

  test("cleans up temporary npm credentials after callback failure", async () => {
    const tempRoot = await createTemporaryRoot();
    let configPath;

    await assert.rejects(
      withNpmAuth({ token: "npm-secret-token", tempRoot }, async (context) => {
        configPath = context.configPath;
        throw new Error("publish failed");
      }),
      /publish failed/,
    );

    await assertPathMissing(configPath);
  });

  test("uses an AskPass script without embedding Git credentials", async () => {
    const username = "release-user";
    const token = "git-secret-token";
    const tempRoot = await createTemporaryRoot();
    let askPassPath;

    await withGitAskPass({ username, token, tempRoot }, async (context) => {
      askPassPath = context.askPassPath;
      const content = await readFile(askPassPath, "utf8");
      const fileStat = await stat(askPassPath);

      assert.doesNotMatch(content, new RegExp(username));
      assert.doesNotMatch(content, new RegExp(token));
      assert.equal(fileStat.mode & 0o777, 0o700);
      assert.equal(context.env.GIT_TERMINAL_PROMPT, "0");

      const usernameResult = await execFileAsync(
        askPassPath,
        ["Username for 'https://gitlab.com':"],
        { env: context.env },
      );
      const passwordResult = await execFileAsync(
        askPassPath,
        ["Password for 'https://gitlab.com':"],
        { env: context.env },
      );

      assert.equal(usernameResult.stdout.trim(), username);
      assert.equal(passwordResult.stdout.trim(), token);
    });

    await assertPathMissing(askPassPath);
  });

  test("cleans up AskPass after callback failure", async () => {
    const tempRoot = await createTemporaryRoot();
    let askPassPath;

    await assert.rejects(
      withGitAskPass(
        { username: "release-user", token: "git-secret-token", tempRoot },
        async (context) => {
          askPassPath = context.askPassPath;
          throw new Error("push failed");
        },
      ),
      /push failed/,
    );

    await assertPathMissing(askPassPath);
  });

  test("removes credentials from supported Git remote URLs", () => {
    assert.equal(
      createSafeHttpsRemoteUrl(
        "https://release-user:git-secret-token@gitlab.com/group/repo.git",
      ),
      "https://gitlab.com/group/repo.git",
    );
    assert.equal(
      createSafeHttpsRemoteUrl("git@gitlab.com:group/repo.git"),
      "https://gitlab.com/group/repo.git",
    );
  });

  test("redacts raw, encoded, and URL-embedded credentials", () => {
    const npmToken = "npm-secret:/token";
    const gitToken = "git-secret-token";
    const message = [
      npmToken,
      encodeURIComponent(npmToken),
      `https://release-user:${gitToken}@gitlab.com/group/repo.git`,
    ].join(" ");

    const redacted = redactSecrets(message, [npmToken, gitToken], {});

    assert.doesNotMatch(redacted, /npm-secret|git-secret|release-user/);
    assert.match(redacted, /\[REDACTED\]/);
  });
});

async function createTemporaryRoot() {
  const directory = await mkdtemp(path.join(tmpdir(), "orderly-auth-test-"));
  temporaryRoots.push(directory);
  return directory;
}

async function assertPathMissing(filePath) {
  await assert.rejects(access(filePath), { code: "ENOENT" });
}
