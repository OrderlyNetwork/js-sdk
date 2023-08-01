import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  target: "es6",
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
