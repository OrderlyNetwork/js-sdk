import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests should not initialize the Storybook browser project or its presets.
export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: [
      {
        find: /^@orderly\.network\/markets$/,
        replacement: fileURLToPath(
          new URL("../../packages/markets/src/index.ts", import.meta.url),
        ),
      },
      {
        find: /^@orderly\.network\/utils$/,
        replacement: fileURLToPath(
          new URL("../../packages/utils/src/index.ts", import.meta.url),
        ),
      },
      {
        find: "@orderly.network/net/src",
        replacement: fileURLToPath(
          new URL("../../packages/net/src", import.meta.url),
        ),
      },
    ],
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
