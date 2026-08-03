const fs = require("node:fs");
const path = require("node:path");
const { notifySafely } = require("./notify");
const { redactSecrets } = require("./releaseCredentials");

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const MAX_ERROR_RESPONSE_LENGTH = 2_000;
const REPOSITORY_ROOT = path.resolve(__dirname, "..");

async function main({
  env = process.env,
  fetchImpl = global.fetch,
  notify = notifySafely,
} = {}) {
  const config = getTriggerConfig(env);
  // Use CI web UI URLs, not the GitLab API request URL (browser opens to 404).
  const ciJobUrl = env.CI_JOB_URL;
  const ciPipelineUrl = env.CI_PIPELINE_URL;
  const ciLinkUrl = ciJobUrl || ciPipelineUrl;
  const ciLinkLabel = ciJobUrl ? "View Job" : "View Pipeline";

  try {
    const packageVersion = getPackageVersion();
    if (!packageVersion) {
      throw new Error("Package version not found");
    }

    await triggerPipeline(packageVersion, { env, fetchImpl, notify });
  } catch (error) {
    const message = redactSecrets(
      `Error triggering pipeline: ${getErrorMessage(error)}`,
      [config.gitToken, config.token],
      env,
    );
    console.error(message);
    await notify(message, {
      link: ciLinkUrl ? { label: ciLinkLabel, url: ciLinkUrl } : undefined,
    });
    throw error;
  }
}

async function checkBranchIsExist(
  branch,
  {
    projectId,
    gitToken,
    fetchImpl = global.fetch,
    logger = console,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  },
) {
  const url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(projectId)}/repository/branches/${encodeURIComponent(branch)}`;
  logger.log(`Checking downstream branch: ${branch}`);

  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        "PRIVATE-TOKEN": gitToken,
      },
    },
    {
      fetchImpl,
      operation: "Branch lookup",
      secrets: [gitToken],
      timeoutMs,
    },
  );

  if (!response.ok) {
    const responseDetails = await readErrorResponse(response, [gitToken]);

    if (
      response.status === 404 &&
      responseIndicatesMissingBranch(responseDetails)
    ) {
      return false;
    }

    throw createHttpError("Branch lookup", url, response, responseDetails, [
      gitToken,
    ]);
  }

  return true;
}

async function triggerPipeline(
  packageVersion,
  {
    env = process.env,
    fetchImpl = global.fetch,
    logger = console,
    notify = notifySafely,
    timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
  } = {},
) {
  const config = getTriggerConfig(env);
  validateTriggerConfig(config);
  const ref = getTriggerBranch(config);

  const branchIsExist = await checkBranchIsExist(ref, {
    projectId: config.projectId,
    gitToken: config.gitToken,
    fetchImpl,
    logger,
    timeoutMs,
  });
  if (!branchIsExist) {
    await notify(
      `The ${ref} branch was not found, so the pipeline was not triggered`,
    );
    return;
  }

  const formData = new FormData();
  formData.append("token", config.token);
  formData.append("ref", ref);
  formData.append("variables[PACKAGE_VERSION]", packageVersion);
  formData.append("variables[TRIGGER_BRANCH]", ref);
  formData.append("variables[RELEASE_TAG_ENV]", config.releaseTagEnv);
  formData.append("variables[APP_TARGET]", config.appTarget);

  const pipelineUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(config.projectId)}/trigger/pipeline`;
  const response = await fetchWithTimeout(
    pipelineUrl,
    {
      method: "POST",
      body: formData,
    },
    {
      fetchImpl,
      operation: "Pipeline trigger",
      secrets: [config.gitToken, config.token],
      timeoutMs,
    },
  );

  if (!response.ok) {
    const responseDetails = await readErrorResponse(response, [
      config.gitToken,
      config.token,
    ]);
    throw createHttpError(
      "Pipeline trigger",
      pipelineUrl,
      response,
      responseDetails,
      [config.gitToken, config.token],
    );
  }

  const result = await response.json();
  logger.log(`Pipeline triggered successfully: ${result.id ?? "unknown"}`);
  await notify(`Pipeline on the ${ref} branch was triggered successfully`);
  return result;
}

function getPackageVersion(rootDirectory = REPOSITORY_ROOT) {
  const hooksPackage = path.resolve(
    rootDirectory,
    "packages/hooks/package.json",
  );
  const hooksPackageJson = JSON.parse(fs.readFileSync(hooksPackage, "utf8"));
  return hooksPackageJson?.version;
}

const TRIGGER_CONFIG_FIELDS = [
  { key: "projectId", envName: "TRIGGER_PIPELINE_PROJECT_ID", required: true },
  { key: "token", envName: "TRIGGER_PIPELINE_TOKEN", required: true },
  { key: "gitToken", envName: "GIT_TOKEN", required: true },
  { key: "ciBranch", envName: "CI_COMMIT_BRANCH", required: true },
  // Required by downstream bump_sdk_and_release rules (frontend-ci.yaml).
  { key: "releaseTagEnv", envName: "RELEASE_TAG_ENV", required: true },
  { key: "appTarget", envName: "APP_TARGET", required: true },
];

const ALLOWED_RELEASE_TAG_ENVS = new Set(["dev", "qa", "prod"]);
const ALLOWED_APP_TARGETS = new Set(["demo", "dmm"]);

function getTriggerConfig(env = process.env) {
  return Object.fromEntries(
    TRIGGER_CONFIG_FIELDS.map(({ key, envName }) => [key, env[envName]]),
  );
}

function getTriggerBranch(config) {
  // Downstream bump_sdk_and_release only allows prod when TRIGGER_BRANCH=main.
  if (config.releaseTagEnv === "prod") {
    return "main";
  }

  if (config.ciBranch) {
    // Replace internal/ with release/, for example internal/20250923 -> release/20250923.
    return config.ciBranch.replace(/^internal\//, "release/");
  }

  return "";
}

function validateTriggerConfig(config) {
  const missingVariables = TRIGGER_CONFIG_FIELDS.filter(
    ({ key, required }) => required && !config[key],
  ).map(({ envName }) => envName);

  if (missingVariables.length > 0) {
    throw new Error(
      `Trigger pipeline configuration missing: ${missingVariables.join(", ")}`,
    );
  }

  if (!ALLOWED_RELEASE_TAG_ENVS.has(config.releaseTagEnv)) {
    throw new Error(
      `Invalid RELEASE_TAG_ENV "${config.releaseTagEnv}"; expected one of: ${[...ALLOWED_RELEASE_TAG_ENVS].join(", ")}`,
    );
  }

  if (!ALLOWED_APP_TARGETS.has(config.appTarget)) {
    throw new Error(
      `Invalid APP_TARGET "${config.appTarget}"; expected one of: ${[...ALLOWED_APP_TARGETS].join(", ")}`,
    );
  }
}

function getErrorMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

async function fetchWithTimeout(
  url,
  options,
  { fetchImpl, operation, secrets, timeoutMs },
) {
  try {
    return await fetchImpl(url, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    if (error?.name === "TimeoutError") {
      throw withRequestUrl(
        new Error(`${operation} timed out after ${timeoutMs}ms`, {
          cause: error,
        }),
        url,
      );
    }

    const errorMessage = redactSecrets(getErrorMessage(error), secrets, {});
    throw withRequestUrl(
      new Error(`${operation} request failed: ${errorMessage}`, {
        cause: error,
      }),
      url,
    );
  }
}

async function readErrorResponse(response, secrets) {
  try {
    const responseBody = await response.text();
    const redactedBody = redactSecrets(responseBody, secrets, {});

    if (redactedBody.length <= MAX_ERROR_RESPONSE_LENGTH) {
      return redactedBody;
    }

    return `${redactedBody.slice(0, MAX_ERROR_RESPONSE_LENGTH)}...[truncated]`;
  } catch {
    return "";
  }
}

function responseIndicatesMissingBranch(responseDetails) {
  try {
    const body = JSON.parse(responseDetails);
    return (
      typeof body?.message === "string" &&
      /\bBranch Not Found\b/i.test(body.message)
    );
  } catch {
    return /\bBranch Not Found\b/i.test(responseDetails);
  }
}

function createHttpError(operation, url, response, responseDetails, secrets) {
  const statusText = response.statusText ? ` ${response.statusText}` : "";
  const details = responseDetails ? `: ${responseDetails}` : "";
  const message = `${operation} failed with status ${response.status}${statusText}${details}`;
  return withRequestUrl(new Error(redactSecrets(message, secrets, {})), url);
}

function withRequestUrl(error, url) {
  error.requestUrl = url;
  return error;
}

if (require.main === module) {
  main().catch(() => {
    process.exitCode = 1;
  });
}

// only for testing
module.exports = {
  getPackageVersion,
  getTriggerBranch,
  main,
  triggerPipeline,
};
