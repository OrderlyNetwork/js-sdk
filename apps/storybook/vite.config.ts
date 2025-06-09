import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  json: {
    namedExports: true,
    stringify: true,
  },
  plugins: [
    react(),
    // https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/81
    nodePolyfills({
      include: ["path", "stream", "util", "assert", "crypto"],
      exclude: ["http"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      overrides: {
        fs: "memfs",
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@orderly.network/chart": resolve(__dirname, "../../packages/chart/src"),
      "@orderly.network/portfolio": resolve(
        __dirname,
        "../../packages/portfolio/src",
      ),
      "@orderly.network/trading-rewards": resolve(
        __dirname,
        "../../packages/trading-rewards/src",
      ),
      "@orderly.network/markets": resolve(
        __dirname,
        "../../packages/markets/src",
      ),
      "@orderly.network/affiliate": resolve(
        __dirname,
        "../../packages/affiliate/src",
      ),
      "@orderly.network/ui": resolve(__dirname, "../../packages/ui/src"),
      "@orderly.network/hooks": resolve(__dirname, "../../packages/hooks/src"),
      "@orderly.network/utils": resolve(__dirname, "../../packages/utils/src"),
      "@orderly.network/react-app": resolve(
        __dirname,
        "../../packages/app/src",
      ),
      "@orderly.network/ui-connector": resolve(
        __dirname,
        "../../packages/ui-connector/src",
      ),
      "@orderly.network/ui-scaffold": resolve(
        __dirname,
        "../../packages/ui-scaffold/src",
      ),
      "@orderly.network/ui-leverage": resolve(
        __dirname,
        "../../packages/ui-leverage/src",
      ),
      "@orderly.network/ui-positions": resolve(
        __dirname,
        "../../packages/ui-positions/src",
      ),
      "@orderly.network/ui-orders": resolve(
        __dirname,
        "../../packages/ui-orders/src",
      ),
      "@orderly.network/ui-transfer": resolve(
        __dirname,
        "../../packages/ui-transfer/src",
      ),
      "@orderly.network/ui-share": resolve(
        __dirname,
        "../../packages/ui-share/src",
      ),
      "@orderly.network/ui-tradingview": resolve(
        __dirname,
        "../../packages/ui-tradingview/src",
      ),
      "@orderly.network/withdraw": resolve(
        __dirname,
        "../../packages/withdraw/src",
      ),
      "@orderly.network/trading": resolve(
        __dirname,
        "../../packages/trading/src",
      ),
      "@orderly.network/ui-chain-selector": resolve(
        __dirname,
        "../../packages/ui-chain-selector/src",
      ),
      "@orderly.network/ui-cross-deposit": resolve(
        __dirname,
        "../../packages/ui-cross-deposit/src",
      ),
      "@orderly.network/ui-order-entry": resolve(
        __dirname,
        "../../packages/ui-order-entry/src",
      ),
      "@orderly.network/ui-tpsl": resolve(
        __dirname,
        "../../packages/ui-tpsl/src",
      ),
      // "@orderly.network/default-evm-adapter": resolve(
      //   __dirname,
      //   "../../packages/default-evm-adapter/src"
      // ),
      "@orderly.network/default-solana-adapter": resolve(
        __dirname,
        "../../packages/default-solana-adapter/src",
      ),
      "@orderly.network/wallet-connector": resolve(
        __dirname,
        "../../packages/wallet-connector/src",
      ),
      "@orderly.network/types": resolve(__dirname, "../../packages/types/src"),
      "@orderly.network/i18n/locales": resolve(
        __dirname,
        "../../packages/i18n/locales",
      ),
      "@orderly.network/i18n": resolve(__dirname, "../../packages/i18n/src"),
      "@orderly.network/wallet-connector-privy": resolve(
        __dirname,
        "../../packages/wallet-connector-privy/src",
      ),
      "@orderly.network/trading-leaderboard": resolve(
        __dirname,
        "../../packages/trading-leaderboard/src",
      ),
      "@orderly.network/net": resolve(__dirname, "../../packages/net/src"),
    },
  },
});
