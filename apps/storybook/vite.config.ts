/// <reference types="vitest/config" />
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolve } from "path";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { packageAlias } from "./packageAlias";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

function getAliasConfig(): Record<string, string> {
  const isProd = process.env.NODE_ENV === "production";

  const watchPackages = process.env.VITE_WATCH_PACKAGES?.split(",").map(
    (item) => {
      const packageName = item.trim();
      if (!packageName.startsWith("@orderly.network/")) {
        return packageName;
      }
      return `${"@orderly.network/"}${packageName}`;
    },
  );

  if (!isProd) {
    const alias: Record<string, string> = {};
    packageAlias.forEach((item) => {
      if (watchPackages?.includes(item.package)) {
        alias[item.package] = resolve(dirname, item.path);
      }
    });
    return alias;
  }

  return {};
}

function getOptimizeDepsConfig(): string[] {
  return packageAlias.map((item) => item.package);
}

// https://vite.dev/config/
export default defineConfig({
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
  json: {
    namedExports: true,
    stringify: true,
  },
  resolve: {
    alias: getAliasConfig(),
  },
  // optimizeDeps: {
  //   exclude: getOptimizeDepsConfig(),
  // },
  build: {
    rollupOptions: {
      // https://cn.rollupjs.org/configuration-options/#maxparallelfileops
      maxParallelFileOps: 100,
    },
    // chunkSizeWarningLimit: 1000,
    // sourcemap: false,
    // commonjsOptions: {
    //   sourceMap: false,
    // },
  },
  // More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: "playwright",
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
