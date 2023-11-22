import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "ES2020",
  splitting: false,
  sourcemap: true,
  treeshake: true,
  clean: true,
  dts: true,
  external: ["react", "react-dom"],
});
