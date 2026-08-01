import { read } from "@changesets/config";
import { readPreState, enterPre, exitPre } from "@changesets/pre";
import { shouldSkipPackage } from "@changesets/should-skip-package";
import { Release, VersionType } from "@changesets/types";
import writeChangeset from "@changesets/write";
import { getPackages } from "@manypkg/get-packages";
import { $, expBackoff, retry, type Shell } from "zx";
import { notifySafely } from "./notify";
import {
  createSafeHttpsRemoteUrl,
  redactSecrets,
  withGitAskPass,
  withNpmAuth,
} from "./releaseCredentials";

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

// Flag indicating if publishing to public npm registry
const normalizedNpmRegistry = npm.registry?.replace(/\/+$/, "");
const isPublicNpm =
  !normalizedNpmRegistry ||
  normalizedNpmRegistry === "https://registry.npmjs.org";

// Package whose version is used for the repository-level release tag
const releasePackageName = "@orderly.network/hooks";

/**
 * Main entry point for the release script.
 * Performs the critical release workflow, then runs post-release tasks on a
 * best-effort basis.
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
  } catch (error: any) {
    // Log error and notify configured providers of failure
    const msg = redactSecrets(
      `release error: ${
        error.message || error.stderr || JSON.stringify(error)
      }`,
      [npm.token, git.token, process.env.TRIGGER_PIPELINE_TOKEN],
    );
    console.error(msg);
    await notifySafely(msg);
    throw error;
  }

  await runPostReleaseTasks();
}

/**
 * Run non-critical tasks after packages and git metadata have been published.
 * Failures are logged but never change the result of a completed release.
 */
async function runPostReleaseTasks() {
  try {
    const successfulPackages = await getSuccessfulPackages();
    await notifySafely(successfulPackages);
  } catch (error) {
    console.error(
      redactSecrets(`Failed to prepare release notification: ${String(error)}`),
    );
  }

  // Ignore the pre-release branch and local releases.
  if (isCI && ciBranch !== "pre-release") {
    try {
      // Trigger pipeline to update SDK version and create tag.
      await $`pnpm trigger:pipeline`;
    } catch (error) {
      console.error(
        redactSecrets(
          `Packages were published, but downstream pipeline trigger failed: ${String(error)}`,
        ),
      );
    }
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

  await withNpmAuth(
    { registry: npm.registry, token: npm.token },
    async ({ env }) => {
      const npm$ = $({ env, verbose: false });

      // Publish packages, retrying if publishing to private/internal registry
      if (isPublicNpm) {
        // Public npm publishes do not retry
        await publishNpm(npm$);
      } else {
        // Retry publishing with exponential backoff on failures
        await retryPublishNpm(npm$);
      }
    },
  );

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

    // Create a repository-level tag before pushing the release commit
    const releaseTag = await createReleaseTag();

    // Push commits to remote repository in CI environment
    if (isCI) {
      const remoteUrl = await getRemoteUrl();
      await withGitAskPass(
        { username: git.username, token: git.token },
        async ({ env }) => {
          const git$ = $({ env, verbose: false });

          if (releaseTag) {
            await pushReleaseCommitAndTag(
              remoteUrl || "origin",
              releaseTag,
              git$,
            );
          } else {
            // Use --no-verify to skip git hooks during push
            await git$`git push --no-verify ${remoteUrl || "origin"}`;
          }
        },
      );
    } else {
      if (releaseTag) {
        await pushReleaseCommitAndTag("origin", releaseTag);
      } else {
        // Push to local origin with local git token authentication
        await $`git push --no-verify`;
      }
    }
  }
}

/**
 * Create a lightweight repository-level tag for a stable public npm release.
 * Pre-release versions and releases to private registries are ignored.
 */
async function createReleaseTag() {
  if (!isPublicNpm) {
    return;
  }

  const packages = await getPackages(process.cwd());
  const releasePackage = packages.packages.find(
    (pkg) => pkg.packageJson.name === releasePackageName,
  );

  if (!releasePackage) {
    throw new Error(`Release package not found: ${releasePackageName}`);
  }

  const version = releasePackage.packageJson.version;
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    console.log(
      `skip repository release tag for pre-release version: ${version}`,
    );
    return;
  }

  const tag = `v${version}`;
  await $`git tag ${tag}`;
  console.log(`repository release tag created successfully: ${tag}`);
  return tag;
}

/**
 * Atomically push the release commit and its repository-level tag.
 */
async function pushReleaseCommitAndTag(
  remote: string,
  tag: string,
  gitCommand: Shell = $,
) {
  const branch = await getCurrentBranch();
  const branchRef = `HEAD:refs/heads/${branch}`;
  const tagRef = `refs/tags/${tag}:refs/tags/${tag}`;

  await gitCommand`git push --atomic --no-verify ${remote} ${branchRef} ${tagRef}`;
  console.log(`release commit and tag pushed successfully: ${tag}`);
}

/**
 * Publish packages to npm using pnpm changeset publish command.
 * Uses custom npm registry if specified.
 */
async function publishNpm(npmCommand: Shell = $) {
  return npmCommand`pnpm changeset publish`;
}

/**
 * Retry publishing to npm up to 10 times with exponential backoff delays.
 */
async function retryPublishNpm(npmCommand: Shell = $) {
  // Delay sequence: 2s, 4s, 8s, then capped at 10s.
  await retry(10, expBackoff("10s", "2s"), () => publishNpm(npmCommand));
}

/**
 * Ensure git working directory is clean before releasing.
 * Throws error if uncommitted changes are present.
 */
async function checkGitStatus() {
  const status = await $`git status --porcelain`.quiet();
  if (!status.stdout.trim()) {
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
  const branch = await $`git branch --show-current`.quiet();
  const currentBranch = ciBranch || branch.stdout.trim();

  if (!currentBranch) {
    throw new Error(
      "Unable to determine the current Git branch from detached HEAD. Check out a branch or set CUSTOM_PRE_TAG before releasing.",
    );
  }

  console.log("currentBranch: ", currentBranch);
  return currentBranch;
}

/**
 * Construct a credential-free HTTPS URL from the configured origin remote.
 */
async function getRemoteUrl() {
  if (!git.token || !git.username) {
    return "";
  }

  const origin = (await $`git remote get-url origin`.quiet()).stdout.trim();
  return createSafeHttpsRemoteUrl(origin);
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
