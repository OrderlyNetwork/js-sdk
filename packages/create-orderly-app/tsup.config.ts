import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["scripts/index.ts"],
  splitting: false,
  minify: !options.watch,
  format: ["cjs"],
  target: "es6",
  // sourcemap: true,
  clean: true,
  // dts: true,
}));
