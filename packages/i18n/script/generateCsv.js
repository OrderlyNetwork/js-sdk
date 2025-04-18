const fs = require("fs-extra");
const path = require("path");
const { checkFileExists } = require("./utils");
const { multiJson2Csv } = require("./json-csv-converter");
const { allResources } = require("../dist");

/** Generate a locale CSV file */
async function generateCsv(outputPath) {
  const headers = [""];
  const jsonList = [];

  for (const key of Object.keys(allResources)) {
    const json = allResources[key];
    headers.push(key);
    jsonList.push(json);
  }

  const csv = multiJson2Csv(jsonList, headers);

  const csvPath = path.resolve(outputPath);

  await checkFileExists(outputPath);

  await fs.outputFile(outputPath, csv, { encoding: "utf8" });

  console.log("generateCsv success =>", csvPath);
}

module.exports = {
  generateCsv,
};
