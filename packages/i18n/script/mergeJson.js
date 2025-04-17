const fs = require("fs-extra");
const path = require("path");
const { checkFileExists, findJsonFiles } = require("./utils");

/**
 * Merge default and extend JSON files back into one file
 * @param {string} inputDir - The input directory containing both default and extend JSON files
 * @param {string} outputDir - The output directory for merged JSON files
 */
async function mergeJson(inputDir, outputDir) {
  const jsonFiles = await findJsonFiles(inputDir);

  for (const file of jsonFiles) {
    const defaultJsonPath = path.resolve(inputDir, file);
    const extendJsonPath = path.resolve(inputDir, "extend", file);

    // Read default JSON file
    const defaultJson = await fs.readJSON(defaultJsonPath, {
      encoding: "utf8",
    });

    // Read extend JSON file if it exists
    let extendJson = {};
    if (await fs.pathExists(extendJsonPath)) {
      extendJson = await fs.readJSON(extendJsonPath, {
        encoding: "utf8",
      });
    }

    // Merge the JSON objects
    const mergedJson = {
      ...defaultJson,
      ...extendJson,
    };

    const outputPath = path.resolve(outputDir, file);
    await checkFileExists(outputPath);

    await fs.outputFile(outputPath, JSON.stringify(mergedJson, null, 2), {
      encoding: "utf8",
    });

    console.log("mergeJson success =>", outputPath);
  }
}

module.exports = {
  mergeJson,
};
