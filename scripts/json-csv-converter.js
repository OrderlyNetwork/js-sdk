const fs = require("fs");
const path = require("path");
const diff = require("diff");

const separator = ".";

// main();

function main() {
  const [, , inFileName, outFileName, diffFileName, masterFileName] =
    process.argv;
  const inFileNameResolved = path.resolve(inFileName);
  const outFileNameResolved = path.resolve(outFileName);
  const inFile = fs.readFileSync(inFileNameResolved, { encoding: "utf8" });
  if (diffFileName) {
    const diffFileNameResolved = path.resolve(diffFileName);
    const outFile = fs.readFileSync(outFileNameResolved, { encoding: "utf8" });
    let masterFile;
    if (masterFileName) {
      const masterFileNameResolved = path.resolve(masterFileName);
      masterFile = fs.readFileSync(masterFileNameResolved, {
        encoding: "utf8",
      });
    }
    diffFile = diffCsv(inFile, outFile, masterFile);
    fs.writeFileSync(diffFileNameResolved, diffFile, { encoding: "utf8" });
  } else if (inFileNameResolved.endsWith(".json")) {
    const json = JSON.parse(inFile);
    const csv = json2Csv(json);
    console.log("csv", csv);
    fs.writeFileSync(outFileNameResolved, csv, { encoding: "utf8" });
  } else if (inFileNameResolved.endsWith(".csv")) {
    const csv = inFile;
    const json = csv2Json(csv);
    fs.writeFileSync(outFileNameResolved, JSON.stringify(json, undefined, 4), {
      encoding: "utf8",
    });
  }
}

function multiJson2Csv(jsonList, header) {
  if (!Array.isArray(jsonList) || jsonList.length === 0) {
    throw "Object array please.";
  }

  const baseJson = jsonList[0];
  const baseKeys = Object.keys(baseJson);

  let result = header.length ? [header] : [];
  for (const key of baseKeys) {
    const values = [];
    for (const json of jsonList) {
      values.push(json[key]);
    }
    result.push(stringsToCsvLine([key, ...values]));
  }
  return result.join("\n");
}

function csv2multiJson(csv) {
  if (typeof csv !== "string") throw "String please.";
  const json = {};

  const lines = csvToLines(csv);
  const csvLines = lines.filter(Boolean).map(parseCsvLine);
  const headers = csvLines.shift()[0].split(",");
  for (const [index, header] of headers.entries()) {
    json[header] = {};
    for (const line of csvLines) {
      const [key, ...values] = line;
      json[header][key] = values[index];
    }
    if (Object.values(json[header]).every((value) => !value)) {
      delete json[header];
    }
  }

  return json;
}

function json2Csv(json) {
  if (typeof json !== "object" || !json) throw "Object please.";
  return findKeyValues(json).join("\n");
}

function csv2Json(csv) {
  if (typeof csv !== "string") throw "String please.";
  const json = {};
  parseCsvLines(csv).forEach((line) => {
    const [path, value] = line;
    const pathSplit = path.split(separator);
    deepSet(json, pathSplit, value);
  });
  return json;
}

function findKeyValues(o, prefix, l = 0) {
  let result = [];
  for (const key of Object.keys(o)) {
    const fullKey = prefix ? prefix + separator + key : key;
    const value = o[key];
    if (typeof value === "string") {
      result.push(stringsToCsvLine([fullKey, value]));
    } else if (typeof value === "object" && value) {
      result = result.concat(findKeyValues(value, fullKey, l + 1));
    }
  }
  return result;
}

function stringsToCsvLine(line) {
  return line.map((s) => `"${s.replace(/"/g, '""')}"`).join(",");
}

function deepSet(o, path, value) {
  if (path.length > 1) {
    const key = path[0];
    if (!o[key]) {
      o[key] = {};
    }
    deepSet(o[key], path.slice(1), value);
  } else {
    o[path[0]] = value;
  }
}

function parseCsvLines(csv) {
  const lines = csvToLines(csv);
  return lines.filter(Boolean).map(parseCsvLine);
}

function csvToLines(csv) {
  return csv.split(/[\r\n]+/);
}

function parseCsvLine(line) {
  const result = [];
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    switch (char) {
      case ",":
        continue;
      case '"':
        i++;
      default:
        const [str, i2] = parseCsvString(line, i);
        i = i2;
        result.push(str);
    }
  }
  return result;
}

function parseCsvString(line, i) {
  let result = "";
  loop: for (; i < line.length; i++) {
    const char = line[i];
    switch (char) {
      case '"':
        i++;
        if (line[i] === '"') {
          result += '"';
        } else {
          break loop;
        }
        break;
      default:
        result += char;
    }
  }
  return [result, i];
}

function diffCsv(oldCsv, newCsv, originalCsv) {
  const originalValueByKey = {};
  if (originalCsv) {
    parseCsvLines(originalCsv).forEach((line) => {
      const [key, value] = line;
      originalValueByKey[key] = value;
    });
  }
  let result = [];
  const d = diff.diffArrays(csvToLines(oldCsv), csvToLines(newCsv));
  d.forEach((part) => {
    part.value.forEach((line) => {
      if (line) {
        if (!part.removed) {
          const [key] = parseCsvLine(line);
          result.push(
            `${line},"${part.added ? "CHANGED" : ""}"${
              originalCsv ? `,"${originalValueByKey[key] || ""}"` : ""
            }`
          );
        }
      }
    });
  });
  return result.join("\n");
}

module.exports = {
  separator,
  json2Csv,
  csv2Json,
  diffCsv,
  multiJson2Csv,
  csv2multiJson,
};
