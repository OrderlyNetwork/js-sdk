import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "node:path";

export const configCompiled = Handlebars.precompile(
  fs.readFileSync(
    path.resolve(__dirname, "../templates/shared/config.handlebars"),
    // path.resolve(process.cwd(), "templates/shared/config.handlebars"),
    "utf8"
  )
);
