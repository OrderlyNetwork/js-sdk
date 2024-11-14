#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { exec, execSync } = require("child_process");
const path = require("path");

main();

function main() {
  const argv = getArgv();

  if (hasUncommittedChanges()) {
    console.error("Error: There are uncommitted changes in the repository.");
    return;
  }

  const command = getCommand(argv);

  execCommand(command);
}

function getArgv() {
  const argv = yargs(hideBin(process.argv))
    .scriptName("orderly-codemod")
    .usage("Scan and collect props from OrderlyAppProvider components")
    .usage("Usage: $0 [OPTION] PATH")
    .options({
      parser: {
        alias: "p",
        type: "string",
        default: "tsx",
        choices: ["babel", "babylon", "flow", "ts", "tsx"],
        describe: "the parser to use for parsing the source files",
      },
      extensions: {
        alias: "ext",
        type: "string",
        default: "tsx",
        describe:
          "transform files with these file extensions (comma separated list)",
      },
      ignore: {
        alias: "i",
        type: "string",
        default: "node_modules",
        describe: "ignore files that match a provided glob expression",
      },
    })
    .demandCommand(
      1,
      "Error: You have to provide at least one file/directory to transform."
    )
    .help()
    .alias("help", "h").argv;

  return argv;
}

function getCommand(argv) {
  const { _, parser, extensions, ignore } = argv;

  const _path = _[0];
  const fullPath = path.resolve(_path);

  const i =
    ignore === "node_modules"
      ? ignore
      : `node_modules --ignore-pattern=${ignore}`;

  const command = `npx jscodeshift --parser=${parser} --extensions=${extensions} --ignore-pattern=${i} --transform=./command/transformer.js ${fullPath}`;

  // console.log("command: ", command);
  return command;
}

function execCommand(command) {
  const cwd = path.resolve(__dirname, "../");
  exec(command, { cwd }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`error: ${stderr}`);
      return;
    }
    console.log(`${stdout}`);
  });
}

function hasUncommittedChanges() {
  try {
    const statusOutput = execSync("git status --porcelain", {
      encoding: "utf-8",
    });

    return statusOutput.trim().length > 0;
  } catch (error) {
    console.error("Error checking git status:", error);
    return false;
  }
}
