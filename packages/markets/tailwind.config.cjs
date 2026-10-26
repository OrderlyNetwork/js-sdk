const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,js,tsx,jsx,mdx}",
    "../markets-core/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../prediction/src/prediction/{predictionMarketPanel.ui,predictionDropdownPanel,usePredictionMarketsExtension}.{ts,tsx}",
  ],
  presets: [require(path.resolve(__dirname, "../ui/tailwind.config.js"))],
};
