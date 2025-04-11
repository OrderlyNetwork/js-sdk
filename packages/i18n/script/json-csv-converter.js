const { validateI18nValue } = require("./utils");

const separator = ".";

function multiJson2Csv(jsonList, header) {
  if (!Array.isArray(jsonList) || jsonList.length === 0) {
    throw "Object array please.";
  }

  const baseJson = jsonList[0];
  const baseKeys = Object.keys(baseJson);
  const errors = {};
  let result = header.length ? [header] : [];
  for (const key of baseKeys) {
    const values = [];
    for (const json of jsonList) {
      const val = json[key] || "";
      values.push(val);
      const bool = validateI18nValue(val);
      if (!bool.valid) {
        errors[key] = val;
      }
    }
    result.push(stringsToCsvLine([key, ...values]));
  }
  if (Object.keys(errors).length > 0) {
    throw new Error(
      "valid i18n value failed, please check the value of the following values: " +
        JSON.stringify(errors, null, 4)
    );
  }
  return result.join("\n");
}

function csv2multiJson(csv) {
  if (typeof csv !== "string") throw "String please.";
  const json = {};

  const lines = csvToLines(csv);
  const csvLines = lines.filter(Boolean).map(parseCsvLine);
  const headers = csvLines.shift()[0].split(",");
  const errors = {};
  for (const [index, header] of headers.entries()) {
    json[header] = {};
    for (const line of csvLines) {
      const [key, ...values] = line;
      const val = values[index];
      json[header][key] = val;
      const bool = validateI18nValue(val);
      if (!bool.valid) {
        errors[key] = val;
      }
    }
    if (Object.keys(errors).length > 0) {
      throw new Error(
        "valid i18n value failed, please check the value of the following values: " +
          JSON.stringify(errors, null, 4)
      );
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

module.exports = {
  separator,
  json2Csv,
  csv2Json,
  multiJson2Csv,
  csv2multiJson,
};
