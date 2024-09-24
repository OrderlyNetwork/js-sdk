import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  target: "es2020",
  splitting: false,
  sourcemap: true,
  clean: !options.watch,
  dts: true,
  tsconfig: "tsconfig.build.json",
}));
