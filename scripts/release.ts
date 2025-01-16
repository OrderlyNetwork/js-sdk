import { getPackages } from "@manypkg/get-packages";
import { shouldSkipPackage } from "@changesets/should-skip-package";
import writeChangeset from "@changesets/write";
import { read } from "@changesets/config";
import simpleGit from "simple-git";
import { Release } from "@changesets/types";
import { $ } from "zx";
import https from "https";
const git = simpleGit();

$.verbose = true;

const npm = {
  registry: process.env.NPM_REGISTRY,
  token: process.env.NPM_TOKEN,
};

const gitInfo = {
  repo: process.env.GIT_REPO,
  token: process.env.GIT_TOKEN,
  username: process.env.GIT_USERNAME,
  name: process.env.GIT_NAME,
  email: process.env.GIT_EMAIL,
};

const telegram = {
  token: process.env.TELEGRAM_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
};
// https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#clone-repository-using-personal-access-token
// git clone https://<username>:<personal_token>@gitlab.com/gitlab-org/gitlab.git
const remoteUrl = `https://${gitInfo.username}:${gitInfo.token}@gitlab.com/${gitInfo.repo}.git`;
console.log("remoteUrl", remoteUrl);

// console.log("gitInfo", gitInfo);
// console.log("telegram", telegram);

/** release patch version */
async function main() {
  // const res = await $`git config user.name`;
  // return;
  try {
    await checkGitStatus();
    await generateChangeset();
    await release();
    const successfullyPackages = await getVersions();
    // await notifyTelegram(successfullyPackages);
  } catch (err: any) {
    const msg = err.message || err.stderr || JSON.stringify(err);
    console.log("publish error: ", msg);
    // await notifyTelegram(msg);
  }
}

async function init() {
  try {
    await git.addConfig("user.name", gitInfo.name!);
    await git.addConfig("user.email", gitInfo.email!);

    // await git.addRemote("origin", remoteUrl);
    console.log("Authenticated successfully.");
  } catch (err) {
    console.error("Authenticated failed:", err);
  }
}

async function checkGitStatus() {
  const status = await git.status();
  if (status.isClean()) {
    return true;
  }
  throw new Error(
    "publish error: There are uncommitted changes, please commit"
  );
}

async function notifyTelegram(message: string) {
  const url = `https://api.telegram.org/bot${telegram.token}/sendMessage`;
  const data = JSON.stringify({
    chat_id: telegram.chatId,
    text: formatCodeMessage(message),
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

async function getVersions() {
  const cwd = process.cwd();
  const packages = await getPackages(cwd);
  const publicPackages = packages.packages
    .filter((pkg) => !pkg.packageJson.private)
    .map((pkg) => `${pkg.packageJson.name}@${pkg.packageJson.version}`);

  const successfullyPackages = publicPackages.join("\n");

  const message = `packages published successfully:\n${successfullyPackages}`;
  console.log(message);

  return message;
}

async function release() {
  await $`pnpm changeset version`;

  await $`pnpm version:g`;

  await $`pnpm build`;

  await authNPM();

  await $`${
    npm.registry ? `npm_config_registry=${npm.registry}` : ""
  } pnpm changeset publish`;

  // restore .npmrc file change
  await $`git restore .npmrc`;

  // set git commit user
  await $`git config user.name "${gitInfo.name}"`;
  await $`git config user.email "${gitInfo.email}"`;

  await $`git add .`;

  await $`git commit -m "publish"`;

  await $`git push ${remoteUrl}`;
}

/** In the CI, create a temporary .npmrc file to access npm */
async function authNPM() {
  const registry = npm.registry!.replace("http://", "").replace("https://", "");
  const content = `\n//${registry}/:_authToken="${npm.token}"`;
  await $`echo ${content} >> .npmrc`;
}

async function generateChangeset() {
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
    type: "patch",
  }));

  const changesetID = await writeChangeset(
    {
      releases,
      summary: "publish",
    },
    cwd
  );
  logger("create changeset");
  console.log("\n=== Summary of changesets ===");
  console.log("patch:", changedPackagesNames.join(", "));
  console.log("generate changeset successfully:", changesetID);
}

function logger(message: string) {
  console.log(`====== ${message} ======`);
}

main();
