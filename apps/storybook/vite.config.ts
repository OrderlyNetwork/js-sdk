/// <reference types="vitest/config" />
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
// https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react
// import react from "@vitejs/plugin-react";
// https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react-swc
import react from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { getWatchPackages, getWatchIgnores } from "./watchPackages.config.mts";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

function getAliasConfig(): Record<string, string> {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const { watchs } = getWatchPackages();

    return watchs.reduce(
      (obj, item) => {
        obj[item.package] = item.path;
        return obj;
      },
      {} as Record<string, string>,
    );
  }

  return {};
}

function getSSLHttpsConfig() {
  if (!process.env.VITE_SSL_KEY_PATH || !process.env.VITE_SSL_CERT_PATH) {
    return undefined;
  }
  return {
    key: fs.readFileSync(process.env.VITE_SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.VITE_SSL_CERT_PATH),
  };
}

function getOptimizeDepsConfig() {
  // const allPackages = getAllPackages();
  // return allPackages.map((item) => item.package);
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    open: true,
    host: true,
    watch: {
      // storybook has own watch config, need to use viteFinal to override this in main.ts
      ignored: getWatchIgnores(),
    },
    https: getSSLHttpsConfig(),
  },
  plugins: [
    react(),
    // https://github.com/davidmyersdev/vite-plugin-node-polyfills/issues/81
    nodePolyfills({
      include: ["path", "stream", "util", "assert", "crypto", "buffer"],
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
    /**
     * Workspace packages (e.g. @orderly.network/plugin-core) prebundled into
     * `.vite/deps` must resolve `react` to the same instance as the app, or
     * hooks like useContext see a null dispatcher (duplicate React).
     */
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    /** Pin React into the optimizer so deps graph shares one copy with plugin-core. */
    include: ["react", "react/jsx-runtime", "react-dom", "react-dom/client"],
  },
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
            provider: playwright({}),
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
