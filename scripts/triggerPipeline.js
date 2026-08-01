const fs = require("node:fs");
const path = require("node:path");
const { notifySafely } = require("./notify");
const { redactSecrets } = require("./releaseCredentials");

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
const MAX_ERROR_RESPONSE_LENGTH = 2_000;
const REPOSITORY_ROOT = path.resolve(__dirname, "..");

async function main({ env = process.env, fetchImpl = global.fetch } = {}) {
  const config = getTriggerConfig(env);

  try {
    const packageVersion = getPackageVersion();
    if (!packageVersion) {
      throw new Error("Package version not found");
    }

    await triggerPipeline(packageVersion, { env, fetchImpl });
  } catch (error) {
    const message = redactSecrets(
      `Error triggering pipeline: ${getErrorMessage(error)}`,
      [config.gitToken, config.token],
      env,
    );
    console.error(message);
    const requestUrl = getRequestUrl(error);
    await notifySafely(message, {
      link: requestUrl
        ? { label: "View Pipeline", url: requestUrl }
        : undefined,
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
  const ref = getTriggerBranch(config);
  validateTriggerConfig(config, ref);

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

function getTriggerConfig(env = process.env) {
  return {
    ciBranch: env.CI_COMMIT_BRANCH,
    gitToken: env.GIT_TOKEN,
    projectId: env.TRIGGER_PIPELINE_PROJECT_ID,
    token: env.TRIGGER_PIPELINE_TOKEN,
    branch: env.TRIGGER_PIPELINE_BRANCH,
  };
}

function getTriggerBranch(config) {
  if (config.branch) {
    return config.branch;
  }

  if (config.ciBranch) {
    // Replace internal/ with release/, for example internal/20250923 -> release/20250923.
    return config.ciBranch.replace(/^internal\//, "release/");
  }

  return "";
}

function validateTriggerConfig(config, ref) {
  const missingVariables = [];

  if (!config.projectId) missingVariables.push("TRIGGER_PIPELINE_PROJECT_ID");
  if (!config.token) missingVariables.push("TRIGGER_PIPELINE_TOKEN");
  if (!config.gitToken) missingVariables.push("GIT_TOKEN");
  if (!ref) {
    missingVariables.push("TRIGGER_PIPELINE_BRANCH or CI_COMMIT_BRANCH");
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Trigger pipeline configuration missing: ${missingVariables.join(", ")}`,
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

function getRequestUrl(error) {
  return error instanceof Error && typeof error.requestUrl === "string"
    ? error.requestUrl
    : undefined;
}

if (require.main === module) {
  main().catch(() => {
    process.exitCode = 1;
  });
}

module.exports = {
  checkBranchIsExist,
  getPackageVersion,
  getTriggerBranch,
  triggerPipeline,
  validateTriggerConfig,
};
