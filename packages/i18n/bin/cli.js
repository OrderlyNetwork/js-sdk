#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { generateCsv } = require("../script/generateCsv");
const { json2csv } = require("../script/json2csv");
const { csv2json } = require("../script/csv2json");
const { diffCsv } = require("../script/diffCsv");
const { fillJson } = require("../script/fillJson");
main();

async function main() {
  console.log("process.argv", process.argv);
  const argv = getArgv();

  const { _, input, output, oldFile, newFile, outputDir } = argv;

  const command = _[0];
  console.log("argv", argv);

  switch (command) {
    case "generateCsv":
      await generateCsv(output);
      break;
    case "json2csv":
      await json2csv(input, output);
      break;
    case "csv2json":
      await csv2json(input, outputDir);
      break;
    case "diffcsv":
      await diffCsv(oldFile, newFile);
      break;
    case "fillJson":
      await fillJson(input, output);
      break;
    default:
      console.log("Invalid command");
      break;
  }
}

function getArgv() {
  const argv = yargs(hideBin(process.argv))
    .scriptName("")
    .usage("i18n locale tools")
    .usage("$0 <command> [options]")
    .strict()
    // Error if no subcommand is provided
    .demandCommand(1, "Please provide a valid subcommand")
    .help()
    // Add `-h` as an alias for `--help`
    .alias("h", "help")

    // generateCsv command
    .command(
      "generateCsv <output>",
      "Generate a locale CSV file",
      (yargs) => {
        return yargs.positional("output", {
          describe: "Output path for the locale CSV file",
          type: "string",
          // Required
          demandOption: true,
        });
      },
      (argv) => {
        console.log(`Generating locale CSV file at: ${argv.output}`);
      }
    )

    // csv2json command
    .command(
      "csv2json <input> <outputDir>",
      "Convert locale CSV to multiple locale JSON files",
      (yargs) => {
        return yargs
          .positional("input", {
            describe: "Input path for the locale CSV file",
            type: "string",
            demandOption: true,
          })
          .positional("outputDir", {
            describe: "Output directory for locale JSON files",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        console.log(
          `Converting ${argv.input} to locale JSON files, output directory: ${argv.outputDir}`
        );
      }
    )

    // json2csv command
    .command(
      "json2csv <input> <output>",
      "Convert locale JSON files to a locale CSV file",
      (yargs) => {
        return yargs
          .positional("input", {
            describe:
              "Path to locale JSON file(s) (supports multiple files, separated by commas)",
            type: "string",
            demandOption: true,
          })
          .positional("output", {
            describe: "Output path for the locale CSV file",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        const inputFiles = argv.input.split(","); // Parse multiple input files
        console.log(
          `Converting locale JSON files: ${inputFiles.join(
            ", "
          )} to locale CSV: ${argv.output}`
        );
      }
    )

    // diffcsv command
    .command(
      "diffcsv <oldFile> <newFile>",
      "Compare two locale CSV files",
      (yargs) => {
        return yargs
          .positional("oldFile", {
            describe: "Path to the first locale CSV file",
            type: "string",
            demandOption: true,
          })
          .positional("newFile", {
            describe: "Path to the second CSV file",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        console.log(
          `Comparing locale CSV files: ${argv.oldFile} and ${argv.newFile}`
        );
      }
    )

    // fillJson command
    .command(
      "fillJson <input> <output>",
      "Fill values from the input locale JSON file and generate a new locale JSON file",
      (yargs) => {
        return yargs
          .positional("input", {
            describe: "Input path for the locale JSON file",
            type: "string",
            demandOption: true,
          })
          .positional("output", {
            describe: "Output path for the locale JSON file",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        console.log(
          `Filling values from the input locale JSON file: ${argv.input} and generating a new locale JSON file: ${argv.output}`
        );
      }
    ).argv;

  return argv;
}
