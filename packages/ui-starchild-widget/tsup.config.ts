import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2022",
  minify: !options.watch,
  splitting: false,
  sourcemap: true,
  treeshake: true,
  clean: !options.watch,
  dts: true,
  tsconfig: "tsconfig.build.json",
  external: [
    "react",
    "react-dom",
    "@orderly.network/hooks",
    "@orderly.network/i18n",
    "@orderly.network/types",
    "@orderly.network/ui",
  ],
  esbuildOptions(esOptions, context) {
    if (!options.watch) {
      esOptions.drop = ["console", "debugger"];
    }
  },
}));
