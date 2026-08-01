const fs = require("node:fs");
const path = require("node:path");
const { notifySafely } = require("./notify");
const { redactSecrets } = require("./releaseCredentials");

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
    await notifySafely(message);
    throw error;
  }
}

async function checkBranchIsExist(
  branch,
  { projectId, gitToken, fetchImpl = global.fetch, logger = console },
) {
  const url = `https://gitlab.com/api/v4/projects/${projectId}/repository/branches/${encodeURIComponent(branch)}`;
  logger.log(`Checking downstream branch: ${branch}`);

  const response = await fetchImpl(url, {
    headers: {
      "PRIVATE-TOKEN": gitToken,
    },
  });

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    throw new Error(`Branch lookup failed with status ${response.status}`);
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

  const response = await fetchImpl(
    `https://gitlab.com/api/v4/projects/${config.projectId}/trigger/pipeline`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Pipeline trigger failed with status ${response.status}`);
  }

  const result = await response.json();
  logger.log(`Pipeline triggered successfully: ${result.id ?? "unknown"}`);
  await notify(`Pipeline on the ${ref} branch was triggered successfully`);
  return result;
}

function getPackageVersion(rootDirectory = process.cwd()) {
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
    return config.ciBranch.replace("internal/", "release/");
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
