import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);
// Mock the same transitive provider instance that the Binance connector imports.
const binanceRequire = createRequire(
  require.resolve("@binance/w3w-blocknative-connector/package.json"),
);

export default defineConfig({
  resolve: {
    alias: {
      "@binance/w3w-ethereum-provider": resolve(
        dirname(
          binanceRequire.resolve("@binance/w3w-ethereum-provider/package.json"),
        ),
        "dist/index.js",
      ),
    },
  },
  test: {
    environment: "jsdom",
    server: {
      deps: {
        inline: ["@binance/w3w-blocknative-connector"],
      },
    },
  },
});
