import { withTV } from "tailwind-variants/transformer";
import { chartPlugin } from "@orderly.network/chart";

const path = require("path");
const { getWatchPackages } = require("./watchPackages.config.mts");

function getTailwindContent() {
  const { watchs } = getWatchPackages();

  const pkgGlobs = watchs
    .filter((item) => item.includeCSS)
    .map((item) => `${item.path}/**/*.{ts,js,tsx,jsx,mdx}`);

  return ["./src/**/*.{ts,js,tsx,jsx,mdx}", ...pkgGlobs];
}

/** @type {import("tailwindcss").Config} */
module.exports = withTV({
  content: getTailwindContent(),
  presets: [
    require(path.resolve(__dirname, "../../packages/ui/tailwind.config.js")),
  ],
  plugins: [chartPlugin()],
});
