import { getPackages } from "@manypkg/get-packages";
import { shouldSkipPackage } from "@changesets/should-skip-package";
import writeChangeset from "@changesets/write";
import { readPreState, enterPre, exitPre } from "@changesets/pre";
import { read } from "@changesets/config";
import { Release, VersionType } from "@changesets/types";
import SimpleGit from "simple-git";
import https from "https";
import { $ } from "zx";

const simpleGit = SimpleGit();

// show command exection log
$.verbose = true;

// ci env
const ciBranch = process.env.CI_COMMIT_BRANCH;
const isCI = ciBranch;

const npm = {
  registry: process.env.NPM_REGISTRY,
  token: process.env.NPM_TOKEN,
};

const git = {
  token: process.env.GIT_TOKEN,
  username: process.env.GIT_USERNAME,
  name: process.env.GIT_NAME,
  email: process.env.GIT_EMAIL,
  commitMessage: process.env.GIT_COMMIT_MESSAGE,
};

const telegram = {
  token: process.env.TELEGRAM_TOKEN,
  // get chat id by https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
  chatId: process.env.TELEGRAM_CHAT_ID,
};

// custom release version type
const releaseVersionType = process.env.RELEASE_VERSION_TYPE as VersionType;
// custom pre tag
const customPreTag = process.env.CUSTOM_PRE_TAG;
// exit pre tag, if true, will exit pre mode
const isExitPreTag = process.env.EXIT_PRE_TAG === "true";

// set publish npm registry
const npmRegistry = npm.registry ? `npm_config_registry=${npm.registry}` : "";

/** release patch version */
async function main() {
  try {
    await checkGitStatus();
    // Verify that the tag is correct only in the ci environment
    if (isCI) {
      await checkBranch();
    }
    await checkTag();
    await release();
    const successfulPackages = await getSuccessfulPackages();
    await notifyTelegram(successfulPackages);
  } catch (err: any) {
    const msg = `release error: ${
      err.message || err.stderr || JSON.stringify(err)
    }`;
    console.error(msg);
    await notifyTelegram(msg);
  }
}

async function checkTag() {
  const cwd = process.cwd();
  const preState = await readPreState(cwd);
  const existPreTag = preState?.mode === "pre" ? preState?.tag : "";
  console.log("current pre tag: ", existPreTag);
  console.log("customPreTag: ", customPreTag);
  console.log("exitPreTag: ", isExitPreTag);

  // when pre tag exists and exitPreTag is true, exit pre tag
  if (existPreTag && isExitPreTag) {
    await exitPre(cwd);
    console.log(`exit ${existPreTag} pre tag success`);
    return;
  }

  // when pre tag and customPreTag exists and pre tag is not equal to customPreTag, switch pre tag to customPreTag
  if (existPreTag && customPreTag && existPreTag !== customPreTag) {
    await exitPre(cwd);
    await enterPre(cwd, customPreTag);
    console.log(`switch ${existPreTag} to ${customPreTag} pre tag success`);
    return;
  }

  // when pre tag exists, exit pre tag
  if (existPreTag) {
    return;
  }

  // when pre tag not exists, enter custom pre tag or get pre tag from current branch
  const preTag = customPreTag || (await getPreTagFromCurrentBranch());
  if (preTag) {
    await enterPre(cwd, preTag);
    console.log(`enter ${preTag} pre tag success`);
  }
}

/**
 * get pre tag from current branch
 * alpha => alpha
 * release/alpha => release-alpha
 * internal-20250410 => internal-20250410
 */
async function getPreTagFromCurrentBranch() {
  const branch = await getCurrentBranch();
  if (branch) {
    return branch.replaceAll("/", "-");
  }
}

async function release() {
  // update dependencies in local environment
  !isCI && (await $`pnpm install --frozen-lockfile`);

  await generateChangeset(releaseVersionType);

  await $`pnpm changeset version`;

  // update the version file for each package
  await $`pnpm version:g`;

  await $`pnpm build`;

  npm.token && (await authNPM());

  await $`${npmRegistry} pnpm changeset publish`;

  // restore .npmrc file change when publish success
  npm.token && (await $`git restore .npmrc`);

  // if not provide, use local user config
  git.name && (await $`git config user.name ${git.name}`);
  git.email && (await $`git config user.email ${git.email}`);

  // add all file to stash
  await $`git add .`;

  if (git.commitMessage) {
    // commit code
    await $`git commit -m ${git.commitMessage}`;

    const remoteUrl = await getRemoteUrl();
    // if not provide, use local origin and git token
    // use --no-verify to ignore push hook
    await $`git push --no-verify ${remoteUrl}`;
  }
}

async function checkGitStatus() {
  const status = await simpleGit.status();
  if (status.isClean()) {
    return true;
  }
  throw new Error(
    "There are uncommitted changes, please commit the code first"
  );
}

async function checkBranch() {
  const currentBranch = await getCurrentBranch();
  if (!/^((internal|npm)\/)/.test(currentBranch!)) {
    throw new Error(
      'Release versions can only operate on branches prefixed with "internal/" or npm/'
    );
  }
}

async function getCurrentBranch() {
  const status = await simpleGit.status();
  const currentBranch = ciBranch || status.current;
  console.log("currentBranch: ", currentBranch);
  return currentBranch;
}

/**
 * if not provide, use local config
 */
async function getRemoteUrl() {
  const repoPath = await getRepoPath();

  if (git.token && git.username && repoPath) {
    // https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#clone-repository-using-personal-access-token
    // git clone https://<username>:<personal_token>@gitlab.com/gitlab-org/gitlab.git
    return `https://${git.username}:${git.token}@gitlab.com/${repoPath}.git`;
  }

  return "";
}

/**
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
 * In the CI, create a temporary .npmrc file to access npm
 * if not provide token, if will use ~/.npmrc file config
 * */
async function authNPM() {
  const registry = npm.registry!.replace("http://", "").replace("https://", "");
  const content = `\n//${registry}/:_authToken="${npm.token}"`;
  await $`echo ${content} >> .npmrc`;
}

async function getSuccessfulPackages() {
  const cwd = process.cwd();
  const packages = await getPackages(cwd);

  const publicPackages = packages.packages
    .filter((pkg) => !pkg.packageJson.private)
    .map((pkg) => `${pkg.packageJson.name}@${pkg.packageJson.version}`);

  const successfullyPackages = publicPackages.join("\n");

  return `packages published successfully:\n${successfullyPackages}`;
}

/**
 * generate changeset file
 * Now only patch versions need to be updated automatically
 */
async function generateChangeset(versionType?: VersionType) {
  const cwd = process.cwd();
  const config = await read(cwd);
  const packages = await getPackages(cwd);

  const versionablePackages = packages.packages.filter(
    (pkg) =>
      !shouldSkipPackage(pkg, {
        ignore: config.ignore,
        allowPrivatePackages: config.privatePackages.version,
      })
  );

  const changedPackagesNames = versionablePackages.map(
    (pkg) => pkg.packageJson.name
  );

  const type = ["major", "minor", "patch"].includes(versionType!)
    ? versionType!
    : "patch";

  console.log("release version type: ", type);

  const releases: Release[] = changedPackagesNames.map((name) => ({
    name,
    type,
  }));

  const changesetID = await writeChangeset(
    {
      releases,
      summary: "publish",
    },
    cwd
  );
  console.log("\n=== Summary of changesets ===");
  console.log("patch:", changedPackagesNames.join(", "));
  console.log("generate changeset successfully:", changesetID);
}

async function notifyTelegram(message: string) {
  if (!telegram.chatId || !telegram.token) {
    console.error("Not provider telegram chat id and token");
    return;
  }
  // max message length
  const maxLength = 4096;

  let sendMessage = message.substring(0, maxLength);

  if (message.length > maxLength) {
    // send first maxLength data
    sendMessage = message.substring(0, maxLength);
    // message = message.substring(maxLength);
    // await notifyTelegram(message);
  }

  const url = `https://api.telegram.org/bot${telegram.token}/sendMessage`;
  const data = JSON.stringify({
    chat_id: telegram.chatId,
    text: formatCodeMessage(sendMessage),
    parse_mode: "HTML",
  });

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const req = https.request(url, options, (res) => {
    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log("Response:", data);
    });
  });

  req.on("error", (e) => {
    console.error("Error:", e);
  });

  req.write(data);
  req.end();
}

function formatCodeMessage(message: string) {
  return `<pre>${message}</pre>`;
}

main();
