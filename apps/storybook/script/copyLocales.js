import fs from "fs-extra";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

async function copyLocales() {
  const __dirname = getDirname();

  await fs.copy(
    path.resolve(__dirname, "../../../packages/i18n/locales"),
    path.resolve(__dirname, "../public/locales")
  );
}

function getDirname() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return __dirname;
}

copyLocales();
