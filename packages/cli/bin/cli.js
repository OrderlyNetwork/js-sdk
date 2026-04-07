#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const chalk = require("chalk");

// Resolve commands directory relative to this file's location
const commandsDir = path.resolve(__dirname, "../src/commands");

/**
 * Ensure process cwd is valid before yargs initialization.
 * Yargs reads cwd eagerly; when users run CLI from a deleted directory,
 * Node throws ENOENT before command parsing starts.
 */
function ensureValidWorkingDirectory() {
  const cwd = process.cwd();
  try {
    fs.accessSync(cwd);
    return;
  } catch {
    const fallbackDir =
      process.env.HOME ||
      process.env.USERPROFILE ||
      path.resolve(__dirname, "..");

    try {
      fs.accessSync(fallbackDir);
      process.chdir(fallbackDir);
      console.warn(
        chalk.yellow(
          `Current working directory is unavailable. Switched to: ${fallbackDir}`,
        ),
      );
    } catch {
      // Fallback also unavailable — let the error surface naturally.
      throw new Error(
        `Current working directory "${cwd}" is inaccessible. ` +
          `Please change to a valid directory and try again.`,
      );
    }
  }
}

ensureValidWorkingDirectory();

yargs(hideBin(process.argv))
  .scriptName("orderly")
  .usage(chalk.cyan("Usage:") + " $0 <command> [options]")
  .alias("v", "version")
  .alias("h", "help")
  .showHelpOnFail(true)
  .demandCommand(1, "Please specify a command.")
  .command("create", "Create a new DEX, plugin, or module", (yargs) => {
    return yargs.commandDir(path.join(commandsDir, "create"));
  })
  .commandDir(commandsDir)
  .command({
    command: "*",
    handler(args) {
      console.error(chalk.red(`Unknown command: ${args._[0]}`));
      console.error(`Run '${chalk.cyan("orderly --help")}' for usage.`);
      process.exit(1);
    },
  })
  .recommendCommands()
  .parse();
