const fs = require("fs-extra");

async function checkFileExists(filePath) {
  if (await fs.exists(filePath)) {
    throw new Error(`${filePath} already exists, please modify file path`);
  }
}

module.exports = {
  checkFileExists,
};
