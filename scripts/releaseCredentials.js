const { mkdtemp, rm, writeFile } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const path = require("node:path");

const SECRET_ENVIRONMENT_VARIABLES = [
  "NPM_TOKEN",
  "GIT_TOKEN",
  "TRIGGER_PIPELINE_TOKEN",
];

/**
 * Run a callback with npm authentication scoped to its child process.
 *
 * The temporary npmrc contains only an environment placeholder, so an
 * interrupted process cannot leave the real token behind on disk.
 */
async function withNpmAuth(
  { registry, token, env = process.env, tempRoot = tmpdir() },
  callback,
) {
  if (!token) {
    return callback({
      env: withRegistryEnvironment(env, registry),
      configPath: undefined,
    });
  }

  const tempDirectory = await mkdtemp(path.join(tempRoot, "orderly-npm-auth-"));
  const configPath = path.join(tempDirectory, "npmrc");
  const registryKey = getNpmRegistryKey(
    registry || "https://registry.npmjs.org",
  );

  try {
    await writeFile(
      configPath,
      `//${registryKey}/:_authToken=\${NPM_TOKEN}\n`,
      {
        mode: 0o600,
      },
    );

    return await callback({
      env: {
        ...withRegistryEnvironment(env, registry),
        NPM_CONFIG_USERCONFIG: configPath,
        NPM_TOKEN: token,
      },
      configPath,
    });
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

/**
 * Run a callback with Git HTTPS credentials exposed only through AskPass.
 */
async function withGitAskPass(
  { username, token, env = process.env, tempRoot = tmpdir() },
  callback,
) {
  if (!username || !token) {
    return callback({ env: { ...env }, askPassPath: undefined });
  }

  const tempDirectory = await mkdtemp(path.join(tempRoot, "orderly-git-auth-"));
  const askPassPath = path.join(tempDirectory, "askpass.sh");
  const askPassScript = `#!/bin/sh
case "$1" in
  *Username*) printf '%s\\n' "$GIT_USERNAME" ;;
  *) printf '%s\\n' "$GIT_TOKEN" ;;
esac
`;

  try {
    await writeFile(askPassPath, askPassScript, { mode: 0o700 });

    return await callback({
      env: {
        ...env,
        GIT_ASKPASS: askPassPath,
        GIT_ASKPASS_REQUIRE: "force",
        GIT_TERMINAL_PROMPT: "0",
        GIT_TOKEN: token,
        GIT_USERNAME: username,
        LC_ALL: "C",
      },
      askPassPath,
    });
  } finally {
    await rm(tempDirectory, { recursive: true, force: true });
  }
}

/**
 * Convert a supported Git remote to a credential-free HTTPS URL.
 */
function createSafeHttpsRemoteUrl(origin) {
  let remoteUrl;

  if (/^https?:\/\//i.test(origin)) {
    remoteUrl = new URL(origin);
    remoteUrl.protocol = "https:";
  } else if (/^ssh:\/\//i.test(origin)) {
    const sshUrl = new URL(origin);
    remoteUrl = new URL(`https://${sshUrl.hostname}${sshUrl.pathname}`);
  } else {
    const sshMatch = origin.match(/^(?:[^@]+@)?([^:]+):(.+)$/);
    if (!sshMatch) {
      throw new Error(`Unsupported git origin URL: ${origin}`);
    }
    remoteUrl = new URL(`https://${sshMatch[1]}/${sshMatch[2]}`);
  }

  remoteUrl.username = "";
  remoteUrl.password = "";
  return remoteUrl.toString();
}

/**
 * Remove known secret values and credentials embedded in HTTPS URLs.
 */
function redactSecrets(message, secrets = [], env = process.env) {
  const configuredSecrets = SECRET_ENVIRONMENT_VARIABLES.map(
    (name) => env[name],
  );
  const replacements = new Set();

  [...configuredSecrets, ...secrets].forEach((secret) => {
    if (!secret) {
      return;
    }
    replacements.add(String(secret));
    replacements.add(encodeURIComponent(String(secret)));
  });

  let result = String(message).replace(
    /(https?:\/\/)(?:[^\s/:@]+):(?:[^\s/@]+)@/gi,
    "$1[REDACTED]@",
  );

  [...replacements]
    .sort((left, right) => right.length - left.length)
    .forEach((secret) => {
      result = result.replaceAll(secret, "[REDACTED]");
    });

  return result;
}

function getNpmRegistryKey(registry) {
  const registryUrl = new URL(
    /^https?:\/\//i.test(registry) ? registry : `https://${registry}`,
  );
  const pathname = registryUrl.pathname.replace(/\/+$/, "");
  return `${registryUrl.host}${pathname}`;
}

function withRegistryEnvironment(env, registry) {
  if (!registry) {
    return { ...env };
  }

  // Set both spellings: npm CLI accepts NPM_CONFIG_*, but @changesets/cli
  // reads process.env.npm_config_registry directly (case-sensitive on Linux).
  return {
    ...env,
    NPM_CONFIG_REGISTRY: registry,
    npm_config_registry: registry,
  };
}

module.exports = {
  createSafeHttpsRemoteUrl,
  redactSecrets,
  withGitAskPass,
  withNpmAuth,
};
