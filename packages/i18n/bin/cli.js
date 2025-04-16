#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { generateCsv } = require("../script/generateCsv");
const { json2csv } = require("../script/json2csv");
const { csv2json } = require("../script/csv2json");
const { diffCsv } = require("../script/diffCsv");
const { fillJson } = require("../script/fillJson");
const { separateJson } = require("../script/separateJson");
const { mergeJson } = require("../script/mergeJson");
main();

async function main() {
  const argv = getArgv();

  const {
    _,
    input,
    output,
    oldFile,
    newFile,
    inputDir,
    outputDir,
    separateKey,
  } = argv;

  const command = _[0];
  // console.log("argv", argv);

  switch (command) {
    case "json2csv":
      await json2csv(inputDir, output);
      break;
    case "csv2json":
      await csv2json(input, outputDir);
      break;
    case "diffcsv":
      await diffCsv(oldFile, newFile);
      break;
    case "generateCsv":
      await generateCsv(output);
      break;
    case "fillJson":
      await fillJson(input, output);
      break;
    case "separateJson":
      await separateJson(inputDir, outputDir, separateKey);
      break;
    case "mergeJson":
      await mergeJson(inputDir, outputDir);
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
      "json2csv <inputDir> <output>",
      "Convert locale JSON files to a locale CSV file",
      (yargs) => {
        return yargs
          .positional("inputDir", {
            describe:
              "Input directory for locale JSON files (all JSON files in the directory will be converted)",
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
        console.log(
          `Converting locale JSON files: ${argv.inputDir} to locale CSV: ${argv.output}`
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
    )

    // separateJson command
    .command(
      "separateJson <inputDir> <outputDir> <separateKey>",
      "Separate json file default and extend key values based on the key",
      (yargs) => {
        return yargs
          .positional("inputDir", {
            describe: "Input directory for locale JSON files",
            type: "string",
            demandOption: true,
          })
          .positional("outputDir", {
            describe: "Output directory for locale JSON files",
            type: "string",
            demandOption: true,
          })
          .positional("separateKey", {
            describe: "Key to separate the json files",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        console.log(
          `Separating json files into multiple files: ${argv.inputDir} to ${argv.outputDir} with key: ${argv.key}`
        );
      }
    )

    // mergeJson command
    .command(
      "mergeJson <inputDir> <outputDir>",
      "Merge default and extend JSON files back into one file",
      (yargs) => {
        return yargs
          .positional("inputDir", {
            describe:
              "Input directory containing both default and extend JSON files",
            type: "string",
            demandOption: true,
          })
          .positional("outputDir", {
            describe: "Output directory for merged JSON files",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        console.log(
          `Merging JSON files from ${argv.inputDir} to ${argv.outputDir}`
        );
      }
    );

  return argv.argv;
}
