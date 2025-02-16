import { getPackages } from "@manypkg/get-packages";
import { shouldSkipPackage } from "@changesets/should-skip-package";
import writeChangeset from "@changesets/write";
import { read } from "@changesets/config";
import { Release, VersionType } from "@changesets/types";
import SimpleGit from "simple-git";
import https from "https";
import { $ } from "zx";

const simpleGit = SimpleGit();

// show command exection log
$.verbose = true;

console.log("env", process.env);

const isCI = !!process.env.GIT_BRANCH;

const npm = {
  registry: process.env.NPM_REGISTRY,
  token: process.env.NPM_TOKEN,
};

const git = {
  branch: process.env.GIT_BRANCH,
  token: process.env.GIT_TOKEN,
  username: process.env.GIT_USERNAME,
  name: process.env.GIT_NAME,
  email: process.env.GIT_EMAIL,
};

const telegram = {
  token: process.env.TELEGRAM_TOKEN,
  // get chat id by https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
  chatId: process.env.TELEGRAM_CHAT_ID,
};

// set publish npm registry
const npmRegistry = npm.registry ? `npm_config_registry=${npm.registry}` : "";

/** release patch version */
async function main() {
  try {
    await ceheckBranch();
    await checkGitStatus();
    await generateChangeset();
    await release();
    const successfullyPackages = await getVersions();
    await notifyTelegram(successfullyPackages);
  } catch (err: any) {
    const msg = `release error: ${
      err.message || err.stderr || JSON.stringify(err)
    }`;
    console.error(msg);
    await notifyTelegram(msg);
  }
}

async function release() {
  await $`pnpm changeset version`;

  await $`pnpm version:g`;

  await $`pnpm build`;

  await authNPM();

  await $`${npmRegistry} pnpm changeset publish`;

  // restore .npmrc file change when provider npm token and publish success
  npm.token && (await $`git restore .npmrc`);

  // if not provide, use local user config
  git.name && (await $`git config user.name ${git.name}`);
  git.email && (await $`git config user.email ${git.email}`);

  // add all file to stash
  await $`git add .`;

  // commit code
  await $`git commit -m "publish"`;

  const remoteUrl = await getRemoteUrl();
  // if not provide, use local origin and git token
  // use --no-verify to ignore push hook
  await $`git push --no-verify ${remoteUrl}`;
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

async function ceheckBranch() {
  const status = await simpleGit.status();
  const currentBranch = git.branch || status.current;
  console.log("currentBranch: ", currentBranch);
  if (
    !currentBranch?.startsWith("internal/") &&
    !currentBranch?.startsWith("npm/")
  ) {
    throw new Error(
      'Release versions can only operate on branches prefixed with "internal/" or npm/'
    );
  }
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
  console.log("getRepoPath: ", res);
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
  if (!npm.token) return;
  const registry = npm.registry!.replace("http://", "").replace("https://", "");
  const content = `\n//${registry}/:_authToken="${npm.token}"`;
  await $`echo ${content} >> .npmrc`;
}

async function getVersions() {
  const cwd = process.cwd();
  const packages = await getPackages(cwd);
  const publicPackages = packages.packages
    .filter((pkg) => !pkg.packageJson.private)
    .map((pkg) => `${pkg.packageJson.name}@${pkg.packageJson.version}`);

  const successfullyPackages = publicPackages.join("\n");

  const message = `packages published successfully:\n${successfullyPackages}`;

  return message;
}

/**
 * generate changeset file
 */
async function generateChangeset(versionType: VersionType = "patch") {
  const cwd = process.cwd();
  const config = await read(cwd);
  const packages = await getPackages(cwd);

  // const changesetBase = path.resolve(cwd, ".changeset");

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

  const releases: Release[] = changedPackagesNames.map((name) => ({
    name,
    // Now only the patch version needs to be automatically
    type: versionType,
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
