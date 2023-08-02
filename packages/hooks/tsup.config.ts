import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  target: "es6",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  external: ["react", "react-dom", "rxjs"],
});
