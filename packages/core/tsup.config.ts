import { defineConfig } from "tsup";
import { polyfillNode } from "esbuild-plugin-polyfill-node";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  splitting: false,
  minify: !options.watch,
  format: ["esm"],
  target: "ES2020",
  sourcemap: true,
  clean: true,
  dts: true,
  noExternal: ["bs58", "@noble/ed25519"],
  esbuildPlugins: [
    polyfillNode({
      polyfills: {
        buffer: true,
        // crypto: true,
      },
    }),
  ],
}));
