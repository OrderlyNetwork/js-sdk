#!/usr/bin/env node

const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { generateCsv } = require("../script/generateCsv");
const { json2csv } = require("../script/json2csv");
const { csv2json } = require("../script/csv2json");
const { diffCsv } = require("../script/diffCsv");
main();

async function main() {
  const argv = getArgv();

  const { _, input, output, oldFile, newFile, outputDir } = argv;

  const command = _[0];
  console.log("argv", argv);

  if (command === "generateCsv") {
    await generateCsv(output);
  } else if (command === "json2csv") {
    await json2csv(input, output);
  } else if (command === "csv2json") {
    await csv2json(input, outputDir);
  } else if (command === "diffcsv") {
    await diffCsv(oldFile, newFile);
  }
}

function getArgv() {
  const argv = yargs(hideBin(process.argv))
    .scriptName("i18n-converter")
    .usage("$0 <command> [options]") // Usage prompt
    .strict() // Only allow defined commands
    .demandCommand(1, "Please provide a valid subcommand") // Error if no subcommand is provided
    .help()
    .alias("h", "help") // Add `-h` as an alias for `--help`

    // generateCsv command
    .command(
      "generateCsv <output>",
      "Generate a CSV file",
      (yargs) => {
        return yargs.positional("output", {
          describe: "Output path for the CSV file",
          type: "string",
          demandOption: true, // Required
        });
      },
      (argv) => {
        console.log(`Generating CSV file at: ${argv.output}`);
      }
    )

    // csv2json command
    .command(
      "csv2json <input> <outputDir>",
      "Convert CSV to multiple JSON files",
      (yargs) => {
        return yargs
          .positional("input", {
            describe: "Path to the CSV file",
            type: "string",
            demandOption: true,
          })
          .positional("outputDir", {
            describe: "Output directory for JSON files",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        console.log(
          `Converting ${argv.input} to JSON, output directory: ${argv.outputDir}`
        );
      }
    )

    // json2csv command
    .command(
      "json2csv <input> <output>",
      "Convert multiple JSON files to a CSV file",
      (yargs) => {
        return yargs
          .positional("input", {
            describe:
              "Path to JSON file(s) (supports multiple files, separated by commas)",
            type: "string",
            demandOption: true,
          })
          .positional("output", {
            describe: "Output path for the CSV file",
            type: "string",
            demandOption: true,
          });
      },
      (argv) => {
        const inputFiles = argv.input.split(","); // Parse multiple input files
        console.log(
          `Converting JSON files: ${inputFiles.join(", ")} to CSV: ${
            argv.output
          }`
        );
      }
    )

    // diffcsv command
    .command(
      "diffcsv <oldFile> <newFile>",
      "Compare two CSV files",
      (yargs) => {
        return yargs
          .positional("oldFile", {
            describe: "Path to the first CSV file",
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
        console.log(`Comparing CSV files: ${argv.oldFile} and ${argv.newFile}`);
      }
    ).argv;

  return argv;
}
