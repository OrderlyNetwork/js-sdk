import { getPackages } from "@manypkg/get-packages";
import { shouldSkipPackage } from "@changesets/should-skip-package";
import writeChangeset from "@changesets/write";
import { read } from "@changesets/config";
import simpleGit from "simple-git";
import { Release } from "@changesets/types";
import { $ } from "zx";
import https from "https";
const git = simpleGit();

/** publish patch version */
async function main() {
  console.log("argv", process.argv);
  try {
    await generateChangeset();
    await publish();
    const successfullyPackages = await getVersions();
    await notifyTelegram(successfullyPackages);
  } catch (err: any) {
    const msg = err.message || err.stderr || JSON.stringify(err);
    console.log("publish error", msg);
    await notifyTelegram(msg);
  }
}

async function notifyTelegram(message: string) {
  // use MarkdownV2 will not format right
  // const formatMessage = `${escapeMarkdownV2("```")}\n${escapeMarkdownV2(
  //   message
  // )}\n${escapeMarkdownV2("```")}`;
  // use curl will get "File name too long" error
  // await $`curl -X POST "https://api.telegram.org/bot7396209259:AAHMLr_cHiRJ108Xmq-SUe7BNAEdA4j3rpA/sendMessage" -d "chat_id=-4755254285&text=${formatMessage}&parse_mode=MarkdownV2"`.verbose();

  const url =
    "https://api.telegram.org/bot7396209259:AAHMLr_cHiRJ108Xmq-SUe7BNAEdA4j3rpA/sendMessage";
  const data = JSON.stringify({
    chat_id: "-4755254285",
    text: formatCodeMessage(message),
    parse_mode: "HTML",
    // parse_mode: "MarkdownV2",
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

function escapeMarkdownV2(text: string) {
  return text.replace(/([_\*[\]()~`>#+\-=|{}.!])/g, "\\$1");
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

async function publish() {
  logger("pnpm changeset version");
  await $`pnpm changeset version`.verbose();

  logger("pnpm version:g");
  await $`pnpm version:g`.verbose();

  logger("pnpm build");
  await $`pnpm build`.verbose();

  logger("git add");
  await git.add(".");

  logger("git commit");
  git.commit("publish");

  logger("git publish");
  await $`npm_config_registry=http://npm.orderly.network pnpm changeset publish`.verbose();
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
