#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { exec } = require("child_process");

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

const { _, parser, extensions, ignore } = argv;

const path = _[0];

const i =
  ignore === "node_modules"
    ? ignore
    : `node_modules --ignore-pattern=${ignore}`;

const command = `npx jscodeshift --parser=${parser} --extensions=${extensions} --ignore-pattern=${i} --transform=./command/transformer.js ${path}`;

// console.log("command: ", command);

// TODO: eslint

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
