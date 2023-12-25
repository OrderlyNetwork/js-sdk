#!/bin/env node

import { textSync } from "figlet";
import yargs from "yargs";
import kleur from "kleur";
import validateNpmPackageName from "validate-npm-package-name";
import path from "node:path";
// const { hideBin } = require("yargs/helpers");
import { hideBin } from "yargs/helpers";
import pkg from "../package.json";
import prompts from "prompts";
import { create } from "../services/create";
import type { CreateAppOptions } from "../services/types";
import appCreatorManager from "../services/appCreatorManager";
import { walletConnectoies } from "../services/wallets";

console.clear();

console.log(kleur.magenta(textSync("Orderly", { horizontalLayout: "full" })));

const argv = yargs(hideBin(process.argv))
  .version(`v${pkg.version}`)
  .usage("$0 <name> [args]")
  .options({
    name: {
      alias: "n",
      describe: "project name",
      type: "string",

      // demandOption: true,
    },
    framework: {
      describe: "framework",
      type: "string",
      // demandOption: true,
    },
    pages: {
      describe: "pages",
      type: "string",
    },
    walletConnector: {
      describe: "wallet connector",
      type: "string",
    },
  })
  // .fail(function (msg, err, yargs) {
  //   console.log(msg, err, yargs);
  // })
  .help().argv;

yargs.showVersion();

async function run() {
  console.log(kleur.cyan("🚀 Let's create a new Orderly app!"));
  const projectPath = path.resolve(process.cwd(), (argv as any)._[0] ?? ".");

  const enableTerminalCursor = () => {
    process.stdout.write("\x1B[?25h");
  };

  const onState = (state: { aborted: boolean }) => {
    if (state.aborted) {
      console.log(`\n${kleur.green("success")} Cancelled... 👋`);

      // If we don't re-enable the terminal cursor before exiting
      // the program, the cursor will remain hidden

      enableTerminalCursor();
      process.stdout.write("\n");
      process.exit(1);
    }
  };

  const questions: Array<prompts.PromptObject<any>> = [
    {
      type: "text",
      name: "name",
      message: "What is your project named?",
      initial: "my-orderly-app",
      validate: (value) => {
        const result = validateNpmPackageName(value);
        if (!result.validForNewPackages) {
          return `Invalid project name: ${result.errors?.join(", ")}`;
        }
        return true;
      },
      onState,
    },
    {
      type: "text",
      name: "brokerId",
      message: "What is your border id?",
      initial: "orderly",
      onState,
      // validate: (value) => validateNpmPackageName(value),
    },
    {
      type: "multiselect",
      name: "pages",
      message: "Would you like to add which pages?",
      choices: [{ title: "Trading Page", value: "trading" }],
      instructions: false,
      min: 1,
      hint: "- Space to select. Return to submit",
      onState,
    },
    {
      type: "select",
      name: "walletConnector",
      message: "would you like to use which wallet connector?",
      choices: walletConnectoies,
      onState,
    },
    {
      type: "select",
      name: "framework",
      message: "Would you like to use which framework?",
      // initial: "next",
      initial: () => 0,
      choices: appCreatorManager.frameworks.map((item) => ({
        title: item.name,
        value: item.id,
      })),
      onState,
    },
  ];
  prompts.override(argv);
  // prompts.overrideAborting;

  const response = await prompts(questions);

  const fullPath = path.resolve(projectPath, response.name);

  await create({
    ...response,
    mode: "new",
    path: projectPath,
    fullPath,
  } as CreateAppOptions);
}

run().catch((err) => {
  console.error(err);
});
