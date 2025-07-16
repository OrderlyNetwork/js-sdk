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

  if (!isProd) {
    const alias: Record<string, string> = {};
    packageAlias.forEach((item) => {
      alias[item.package] = resolve(dirname, item.path);
    });
    return alias;
  }

  return {};
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
  build: {
    rollupOptions: {
      // https://cn.rollupjs.org/configuration-options/#maxparallelfileops
      maxParallelFileOps: 100,
    },
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
