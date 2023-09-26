import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es6",
  splitting: false,
  sourcemap: true,
  treeshake: true,
  clean: true,
  dts: true,
  external: ["react", "react-dom"],
});
