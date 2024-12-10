const path = require("path");
import { chartPlugin } from "@orderly.network/chart";
import { withTV } from "tailwind-variants/transformer";
import { customThemePlugin } from "./src/tailwind/customTheme";

/** @type {import("tailwindcss").Config} */
module.exports = withTV({
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
    "../../packages/ui-transfer/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-cross-deposit/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-share/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-tradingview/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/wallet-connector/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/trading/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-order-entry/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-tpsl/src/**/*.{ts,js,tsx,jsx,mdx}",
    "../../packages/ui-chain-selector/src/**/*.{ts,js,tsx,jsx,mdx}",
  ],
  presets: [
    require(path.resolve(__dirname, "../../packages/ui/tailwind.config.js")),
  ],
  plugins: [chartPlugin(), customThemePlugin()],
});
