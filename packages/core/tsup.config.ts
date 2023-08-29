import { defineConfig } from "tsup";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  splitting: false,
  minify: !options.watch,
  format: ["cjs", "esm"],
  target: "es6",
  sourcemap: true,
  clean: true,
  dts: true,
  esbuildPlugins: [
    polyfillNode({
      polyfills: {
        buffer: true,
      },
    }),
  ],
}));
