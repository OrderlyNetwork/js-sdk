const fs = require("fs");
const path = require("path");

// Current branch in CI environment
const ciBranch = process.env.CI_COMMIT_BRANCH;
const gitToken = process.env.GIT_TOKEN;

const trigger = {
  projectId: process.env.TRIGGER_PIPELINE_PROJECT_ID,
  token: process.env.TRIGGER_PIPELINE_TOKEN,
  branch: process.env.TRIGGER_PIPELINE_BRANCH,
};

async function main() {
  try {
    const packageVersion = await getPackageVersion();
    if (!packageVersion) {
      throw new Error("Package version not found");
    }
    // console.log("packageVersion: ", packageVersion);

    await triggerPipeline(packageVersion);
  } catch (error) {
    console.error("Error triggering pipeline:", error);
    throw error;
  }
}

async function checkBranchIsExist(branch) {
  // https://docs.gitlab.com/api/branches/#get-single-repository-branch
  const url = `https://gitlab.com/api/v4/projects/${trigger.projectId}/repository/branches/${encodeURIComponent(branch)}`;
  console.log("url: ", url, gitToken);
  try {
    const response = await fetch(url, {
      headers: {
        "PRIVATE-TOKEN": gitToken,
      },
    });

    if (!response.ok) {
      throw new Error(`404 Branch Not Found: ${branch}`);
    }

    const result = await response.json();
    console.log(`The ${branch} branch is exist: `, result);
    // if branch is exist, return true
    return !!result;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function triggerPipeline(packageVersion) {
  const ref = getTriggerBranch();

  if (!ref) {
    console.log("No trigger branch found, skipping pipeline trigger.");
    return;
  }

  const branchIsExist = await checkBranchIsExist(ref);
  if (!branchIsExist) {
    // It’s possible that having no branch is expected, so don't throw an error.
    return;
  }

  if (!trigger.projectId || !trigger.token || !ref) {
    throw new Error(
      "Trigger pipeline failed: Trigger URL, token, or trigger branch not found",
    );
  }

  const formData = new FormData();
  formData.append("token", trigger.token);
  formData.append("ref", ref);
  formData.append("variables[PACKAGE_VERSION]", packageVersion);
  formData.append("variables[TRIGGER_BRANCH]", ref);

  try {
    console.log("triggerPipeline: ", trigger.projectId, formData);
    // https://docs.gitlab.com/ci/triggers/#use-curl
    // https://gitlab.com/api/v4/projects/<project_id>/trigger/pipeline
    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${trigger.projectId}/trigger/pipeline`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Pipeline triggered successfully:", result);
    return result;
  } catch (error) {
    // console.error("Error triggering pipeline:", error);
    throw error;
  }
}

async function getPackageVersion() {
  const hooksPackage = path.resolve("packages/hooks", "package.json");
  const hooksPackageJson = JSON.parse(fs.readFileSync(hooksPackage, "utf8"));
  return hooksPackageJson?.version;
}

function getTriggerBranch() {
  if (trigger.branch) {
    return trigger.branch;
  }

  if (ciBranch) {
    // replace internal/ with release/, example: internal/20250923 => release/20250923
    return ciBranch?.replace("internal/", "release/");
  }

  throw new Error("Trigger branch not found");
}

main();
