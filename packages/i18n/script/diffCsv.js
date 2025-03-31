const fs = require("fs-extra");
const { csv2multiJson } = require("./json-csv-converter");

async function diffCsv(oldFile, newFile) {
  const oldCsv = await fs.readFile(oldFile, { encoding: "utf8" });
  const newCsv = await fs.readFile(newFile, { encoding: "utf8" });

  const oldJson = csv2multiJson(oldCsv);
  const newJson = csv2multiJson(newCsv);
  const diffResult = compareJsonFiles(oldJson, newJson);
  console.log("CSV diff result:", JSON.stringify(diffResult, null, 2));

  // generate .md file
  const markdownContent = generateMarkdown(diffResult);
  await fs.writeFile("locale_changelog.md", markdownContent, {
    encoding: "utf8",
  });

  console.log("✅ locale_changelog.md updated");
}

// Compare function
function compareJsonFiles(oldJson, newJson) {
  const result = {
    added: {},
    removed: {},
    updated: {},
  };

  Object.keys(newJson).forEach((lang) => {
    result.added[lang] = {};
    result.removed[lang] = {};
    result.updated[lang] = {};

    const oldKeys = oldJson[lang] || {};
    const newKeys = newJson[lang];

    // Find added keys
    Object.keys(newKeys).forEach((key) => {
      if (!(key in oldKeys)) {
        result.added[lang][key] = newKeys[key];
      }
    });

    // Find removed keys
    Object.keys(oldKeys).forEach((key) => {
      if (!(key in newKeys)) {
        result.removed[lang][key] = oldKeys[key];
      }
    });

    // Find updated keys (same key, different value)
    Object.keys(newKeys).forEach((key) => {
      if (key in oldKeys && oldKeys[key] !== newKeys[key]) {
        result.updated[lang][key] = {
          old: oldKeys[key],
          new: newKeys[key],
        };
      }
    });
  });

  return result;
}

// generate Markdown conent
function generateMarkdown(diff) {
  let mdContent = `# 📝 Locale Changelog\n\n`;

  // handle added content
  mdContent += `## 🔹 Added Keys\n`;
  Object.keys(diff.added).forEach((lang) => {
    mdContent += `\n### 🌍 Language: **${lang}**\n`;
    mdContent += `| Key | Value |\n| --- | --- |\n`;
    Object.entries(diff.added[lang]).forEach(([key, value]) => {
      mdContent += `| ${key} | ${value} |\n`;
    });
  });

  // handle removed content
  mdContent += `\n## ❌ Removed Keys\n`;
  Object.keys(diff.removed).forEach((lang) => {
    mdContent += `\n### 🌍 Language: **${lang}**\n`;
    mdContent += `| Key | Value |\n| --- | --- |\n`;
    Object.entries(diff.removed[lang]).forEach(([key, value]) => {
      mdContent += `| ${key} | ${value} |\n`;
    });
  });

  // handle updated content
  mdContent += `\n## 🔄 Updated Keys\n`;
  Object.keys(diff.updated).forEach((lang) => {
    if (Object.keys(diff.updated[lang]).length === 0) {
      mdContent += `\n### 🌍 Language: **${lang}**\n> No updates found.\n`;
    } else {
      mdContent += `\n### 🌍 Language: **${lang}**\n`;
      mdContent += `| Key | Old Value | New Value |\n| --- | --- | --- |\n`;
      Object.entries(diff.updated[lang]).forEach(([key, values]) => {
        mdContent += `| ${key} | ${values.old} | ${values.new} |\n`;
      });
    }
  });

  return mdContent;
}

module.exports = {
  diffCsv,
};
