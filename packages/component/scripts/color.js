const postcss = require("postcss");
const postcssJs = require("postcss-js");
const fs = require("fs");
const path = require("path");

const cssText = fs.readFileSync(
  path.join(__dirname, "../src/tailwind.css"),
  "utf8"
);

const root = postcss.parse(cssText);

console.log(postcssJs.objectify(root));
