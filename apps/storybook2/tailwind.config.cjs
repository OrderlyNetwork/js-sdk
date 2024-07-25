const path = require("path");
// const { chartPlugin } = require("@orderly.network/chart");
import { chartPlugin } from "@orderly.network/chart";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-connector/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-orders/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-positions/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/trading-rewards/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/portfolio/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-scaffold/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/affiliate/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/markets/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/chart/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/deposit/src/**/*.{ts,js,tsx,jsx,mdx}",
  ],
  presets: [
    require(path.resolve(__dirname, "../../packages/ui/tailwind.config.js")),
  ],
  plugins: [chartPlugin()],
};
