import { read } from "@changesets/config";
import { readPreState, enterPre, exitPre } from "@changesets/pre";
import { shouldSkipPackage } from "@changesets/should-skip-package";
import { Release, VersionType } from "@changesets/types";
import writeChangeset from "@changesets/write";
import { getPackages } from "@manypkg/get-packages";
import SimpleGit from "simple-git";
import { $, retry, expBackoff } from "zx";
import { notifyTelegram } from "./notifyTelegram";

const simpleGit = SimpleGit();

// Enable verbose logging for shell commands executed via zx
$.verbose = true;

// Current branch in CI environment
const ciBranch = process.env.CI_COMMIT_BRANCH;

// Truthy if running in CI environment
const isCI = ciBranch;

// Whether release was manually triggered
const manualTrigger = process.env.MANUAL_TRIGGER === "true";

// NPM registry and authentication token
const npm = {
  /**  Custom npm registry URL */
  registry: process.env.NPM_REGISTRY,
  /** NPM authentication token */
  token: process.env.NPM_TOKEN,
};

// Git user info and commit message for automated commits
const git = {
  /** Git authentication token */
  token: process.env.GIT_TOKEN,
  /** Git username */
  username: process.env.GIT_USERNAME,
  /** Git user name for commits */
  name: process.env.GIT_NAME,
  /** Git user email for commits */
  email: process.env.GIT_EMAIL,
  /** Commit message for release commits */
  commitMessage: process.env.GIT_COMMIT_MESSAGE,
};

// Custom release version type (major, minor, patch)
const releaseVersionType = process.env.RELEASE_VERSION_TYPE as VersionType;

// Custom pre-release tag to use during pre-release
const customPreTag = process.env.CUSTOM_PRE_TAG;

// Flag to indicate if pre-release mode should be exited
const exitPreTag = process.env.EXIT_PRE_TAG === "true";

// NPM registry environment variable for publishing commands
const npmRegistry = npm.registry ? `npm_config_registry=${npm.registry}` : "";

// Flag indicating if publishing to public npm registry
const isPublicNpm =
  !npm.registry || npm.registry === "https://registry.npmjs.org";

/**
 * Main entry point for the release script.
 * Performs git checks, branch validation, tag handling, release, and notifications.
 * Handles errors and sends failure notifications via Telegram.
 */
async function main() {
  try {
    // Ensure working directory is clean before releasing
    await checkGitStatus();

    // In CI environment, verify branch naming unless manually triggered
    if (isCI && !manualTrigger) {
      await checkBranch();
    }

    // Handle pre-release tag logic
    await checkTag();

    // Perform the release process: version bump, build, publish, and git commit/push
    await release();

    // Get list of successfully published packages
    const successfulPackages = await getSuccessfulPackages();

    // Notify success on Telegram
    await notifyTelegram(successfulPackages);

    // Trigger pipeline to update sdk verson and create tag
    await $`pnpm trigger:pipeline`;
  } catch (error: any) {
    // Log error and notify failure on Telegram
    const msg = `release error: ${
      error.message || error.stderr || JSON.stringify(error)
    }`;
    console.error(msg);
    await notifyTelegram(msg);
    throw error;
  }
}

/**
 * Check and manage pre-release tags.
 * Handles entering, exiting, or switching pre-release modes based on environment variables and current state.
 */
async function checkTag() {
  const cwd = process.cwd();
  const preState = await readPreState(cwd);
  const currentPreTag = preState?.mode === "pre" ? preState?.tag : "";
  console.log("current pre tag: ", currentPreTag);
  console.log("customPreTag: ", customPreTag);
  console.log("exitPreTag: ", exitPreTag);

  // If pre tag exists and exit flag is true, exit pre mode
  if (currentPreTag && exitPreTag) {
    await exitPre(cwd);
    console.log(`exit ${currentPreTag} pre tag success`);
    return;
  }

  // If exit flag is true but, no need to enter pre tag
  if (exitPreTag) {
    return;
  }

  // If pre tag exists and custom pre tag is different, switch pre tag
  if (currentPreTag && customPreTag && currentPreTag !== customPreTag) {
    await exitPre(cwd);
    await enterPre(cwd, customPreTag);
    console.log(`switch ${currentPreTag} to ${customPreTag} pre tag success`);
    return;
  }

  // If pre tag exists, do nothing
  if (currentPreTag) {
    return;
  }

  // If no pre tag exists, enter pre mode with custom tag or derive from branch name
  const preTag = customPreTag || (await getPreTagFromCurrentBranch());
  if (preTag) {
    await enterPre(cwd, preTag);
    console.log(`enter ${preTag} pre tag success`);
  }
}

/**
 * Derive pre-release tag name from the current git branch name.
 * Converts slashes to dashes for tag compatibility.
 * Examples:
 *  alpha => alpha
 *  release/alpha => release-alpha
 *  internal-20250410 => internal-20250410
 */
async function getPreTagFromCurrentBranch() {
  const branch = await getCurrentBranch();
  if (branch) {
    return branch.replaceAll("/", "-");
  }
}

/**
 * Main release workflow.
 * Installs dependencies, generates changesets, versions packages, builds, authenticates, publishes, and pushes git commits.
 */
async function release() {
  // Install dependencies with frozen lockfile locally (skip in CI)
  if (!isCI) {
    await $`pnpm install --frozen-lockfile`;
  }

  // Generate a changeset file for versioning based on releaseVersionType
  await generateChangeset(releaseVersionType);

  // Apply version changes to package.json files
  await $`pnpm changeset version`;

  // Update version files for each package (custom script)
  await $`pnpm version:g`;

  // Build the project after version bump
  await $`pnpm build`;

  // Authenticate with npm registry if token provided
  if (npm.token) {
    await authNPM();
  }

  // Publish packages, retrying if publishing to private/internal registry
  if (isPublicNpm) {
    // Public npm publishes do not retry
    await publishNpm();
  } else {
    // Retry publishing with exponential backoff on failures
    await retryPublishNpm();
  }

  // Restore .npmrc to original state after publishing
  if (npm.token) {
    await $`git restore .npmrc`;
  }

  // Configure git user name and email for commits if provided
  // If not provide, use local user config
  if (git.name) {
    await $`git config user.name ${git.name}`;
  }

  if (git.email) {
    await $`git config user.email ${git.email}`;
  }

  // Stage all changes for commit
  await $`git add .`;

  if (git.commitMessage) {
    // Commit changes with specified message
    await $`git commit -m ${git.commitMessage}`;

    // Push commits to remote repository in CI environment
    if (isCI) {
      const remoteUrl = await getRemoteUrl();
      // Use --no-verify to skip git hooks during push
      await $`git push --no-verify ${remoteUrl}`;
    } else {
      // Push to local origin with local git token authentication
      await $`git push --no-verify`;
    }
  }
}

/**
 * Publish packages to npm using pnpm changeset publish command.
 * Uses custom npm registry if specified.
 */
async function publishNpm() {
  if (npmRegistry) {
    return $`${npmRegistry} pnpm changeset publish`;
  } else {
    return $`pnpm changeset publish`;
  }
}

/**
 * Retry publishing to npm up to 10 times with exponential backoff delays.
 */
async function retryPublishNpm() {
  // Retry 10 times, starting with 10 seconds delay, increasing by 2 seconds, max 10 seconds delay
  await retry(10, expBackoff("10s", "2s"), publishNpm);
}

/**
 * Ensure git working directory is clean before releasing.
 * Throws error if uncommitted changes are present.
 */
async function checkGitStatus() {
  const status = await simpleGit.status();
  if (status.isClean()) {
    return true;
  }
  throw new Error(
    "There are uncommitted changes, please commit the code first",
  );
}

/**
 * Validate that the current branch name matches allowed patterns for releasing.
 * Only branches starting with "internal/" are allowed.
 */
async function checkBranch() {
  const currentBranch = await getCurrentBranch();
  if (!/^(internal\/)/.test(currentBranch!)) {
    throw new Error(
      'Release versions can only operate on branches prefixed with "internal/"',
    );
  }
}

/**
 * Retrieve the current git branch name.
 * Uses CI branch environment variable if available.
 */
async function getCurrentBranch() {
  const status = await simpleGit.status();
  const currentBranch = ciBranch || status.current;
  console.log("currentBranch: ", currentBranch);
  return currentBranch;
}

/**
 * Construct the remote git repository URL with authentication token if provided.
 * Supports GitLab personal access token authentication format.
 */
async function getRemoteUrl() {
  const repoPath = await getRepoPath();

  if (git.token && git.username && repoPath) {
    // Format: https://<username>:<token>@gitlab.com/<repoPath>.git
    return `https://${git.username}:${git.token}@gitlab.com/${repoPath}.git`;
  }

  return "";
}

/**
 * Extract the repository path (owner/name) from the git remote origin URL.
 * Supports HTTPS and SSH URLs for GitHub and GitLab.
 * Examples:
 * https://github.com/OrderlyNetwork/orderly-sdk-js.git => OrderlyNetwork/orderly-sdk-js
 * git@github.com:OrderlyNetwork/orderly-sdk-js.git => OrderlyNetwork/orderly-sdk-js
 */
async function getRepoPath() {
  const res = await $`git remote get-url origin`;
  // console.log("getRepoPath: ", res);
  const origin = res.stdout?.replace(/\s+/g, "");
  const regex = /(?:github\.com|gitlab\.com)[:/](.+?\/.+?)\.git/;
  const match = origin.match(regex);
  const repoPath = match ? match[1] : null;
  return repoPath;
}

/**
 * Authenticate npm by appending an auth token to the local ~/.npmrc file.
 * Uses custom registry if provided, defaults to public npm registry.
 */
async function authNPM() {
  // Remove protocol from registry URL for .npmrc syntax
  const registry = (npm.registry || "https://registry.npmjs.org")
    .replace("http://", "")
    .replace("https://", "");
  const content = `\n//${registry}/:_authToken="${npm.token}"`;
  await $`echo ${content} >> .npmrc`;
}

/**
 * Retrieve a formatted string listing all successfully published public packages.
 */
async function getSuccessfulPackages() {
  const cwd = process.cwd();
  const packages = await getPackages(cwd);

  // Filter out private packages and format as name@version strings
  const publicPackages = packages.packages
    .filter((pkg) => !pkg.packageJson.private)
    .map((pkg) => `${pkg.packageJson.name}@${pkg.packageJson.version}`);

  const successfullyPackages = publicPackages.join("\n");

  return `packages published successfully:\n${successfullyPackages}`;
}

/**
 * Generate a changeset file for versioning packages.
 * Only patch, minor, or major version types are allowed; defaults to patch.
 */
async function generateChangeset(versionType?: VersionType) {
  const cwd = process.cwd();
  const config = await read(cwd);
  const packages = await getPackages(cwd);

  // Filter packages that should be versioned (exclude skipped and private if configured)
  const versionablePackages = packages.packages.filter(
    (pkg) =>
      !shouldSkipPackage(pkg, {
        ignore: config.ignore,
        allowPrivatePackages: config.privatePackages.version,
      }),
  );

  const changedPackagesNames = versionablePackages.map(
    (pkg) => pkg.packageJson.name,
  );

  // Validate version type or default to patch
  const type = ["major", "minor", "patch"].includes(versionType!)
    ? versionType!
    : "patch";

  console.log("release version type: ", type);

  // Create release objects for all changed packages
  const releases: Release[] = changedPackagesNames.map((name) => ({
    name,
    type,
  }));

  // Write the changeset file to disk
  const changesetID = await writeChangeset(
    {
      releases,
      summary: "publish",
    },
    cwd,
  );
  console.log("\n=== Summary of changesets ===");
  console.log("patch:", changedPackagesNames.join(", "));
  console.log("generate changeset successfully:", changesetID);
}

main();
