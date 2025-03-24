const fs = require("fs-extra");
const path = require("path");
const { multiJson2Csv, csv2multiJson } = require("./json-csv-converter");

main();

async function main() {
  const [, , inputFilePaths, outFilePath, diffFileName, masterFileName] =
    process.argv;

  if (path.extname(outFilePath) !== ".csv") {
    await csv2json(inputFilePaths, outFilePath);
  } else {
    await json2csv(inputFilePaths, outFilePath);
  }

  // if (diffFileName) {
  //   const diffFileNameResolved = path.resolve(diffFileName);
  //   const outFile = fs.readFileSync(outFileNameResolved, { encoding: "utf8" });
  //   let masterFile;
  //   if (masterFileName) {
  //     const masterFileNameResolved = path.resolve(masterFileName);
  //     masterFile = fs.readFileSync(masterFileNameResolved, {
  //       encoding: "utf8",
  //     });
  //   }
  //   diffFile = diffCsv(inFile, outFile, masterFile);
  //   fs.writeFileSync(diffFileNameResolved, diffFile, { encoding: "utf8" });
  // }
}

async function csv2json(inputFilePaths, outFilePath) {
  const csv = fs.readFileSync(inputFilePaths, { encoding: "utf8" });

  if (!(await fs.pathExists(outFilePath))) {
    await fs.mkdir(outFilePath);
  }

  const json = csv2multiJson(csv);

  for (const key of Object.keys(json)) {
    const filePath = path.resolve(outFilePath, `${key}.json`);
    await checkFileExists(filePath);
    await fs.writeFile(filePath, JSON.stringify(json[key], undefined, 4), {
      encoding: "utf8",
    });
  }
}

async function json2csv(inputFilePaths, outFilePath) {
  const inputFiles = inputFilePaths.split(",");

  const jsonList = [];
  const headers = [
    "",
    "en",
    "zh-TW",
    "zh-Hans",
    "tr",
    "ru",
    "pt-BR",
    "uk-UA",
    "vi-VN",
    "es-ES",
  ];
  for (const filePath of inputFiles) {
    const json = await fs.readJSON(path.resolve(filePath), {
      encoding: "utf8",
    });
    jsonList.push(json);
    // const fileName = path.basename(filePath).split(".")[0];
    // fileNames.push(fileName);
  }

  const csv = multiJson2Csv(jsonList, headers);

  await checkFileExists(outFilePath);

  await fs.writeFile(outFilePath, csv, { encoding: "utf8" });
}

async function checkFileExists(filePath) {
  if (await fs.exists(filePath)) {
    throw new Error(`${filePath} already exists, please modify file path`);
  }
}
