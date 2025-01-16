import { getPackages } from "@manypkg/get-packages";
import { shouldSkipPackage } from "@changesets/should-skip-package";
import writeChangeset from "@changesets/write";
import { read } from "@changesets/config";
import SimpleGit from "simple-git";
import { Release } from "@changesets/types";
import { $ } from "zx";
import https from "https";
const simpleGit = SimpleGit();

$.verbose = true;

const npm = {
  registry: process.env.NPM_REGISTRY,
  token: process.env.NPM_TOKEN,
};

const git = {
  repo: process.env.GIT_REPO,
  token: process.env.GIT_TOKEN,
  username: process.env.GIT_USERNAME,
  name: process.env.GIT_NAME,
  email: process.env.GIT_EMAIL,
};

const telegram = {
  token: process.env.TELEGRAM_TOKEN,
  // https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
  chatId: process.env.TELEGRAM_CHAT_ID,
};
// https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#clone-repository-using-personal-access-token
// git clone https://<username>:<personal_token>@gitlab.com/gitlab-org/gitlab.git
const remoteUrl = `https://${git.username}:${git.token}@gitlab.com/${git.repo}.git`;

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

  await $`${
    npm.registry ? `npm_config_registry=${npm.registry}` : ""
  } pnpm changeset publish`;

  // restore .npmrc file change
  await $`git restore .npmrc`;

  // set git commit user
  await $`git config user.name ${git.name}`;
  await $`git config user.email ${git.email}`;

  await $`git add .`;

  await $`git commit -m "publish"`;

  await $`git push ${remoteUrl}`;
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
  const currentBranch = status.current;
  if (!currentBranch?.includes("internal/")) {
    throw new Error(
      'Release versions can only operate on branches prefixed with "internal/"'
    );
  }
}

/** In the CI, create a temporary .npmrc file to access npm */
async function authNPM() {
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
  console.log(message);

  return message;
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
  console.log("\n=== Summary of changesets ===");
  console.log("patch:", changedPackagesNames.join(", "));
  console.log("generate changeset successfully:", changesetID);
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

main();
