import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["scripts/index.ts"],
  splitting: false,
  minify: !options.watch,
  format: ["cjs"],
  target: "es5",
  // sourcemap: true,
  clean: !options.watch,
  // publicDir:'templates'
  // dts: true,
}));
