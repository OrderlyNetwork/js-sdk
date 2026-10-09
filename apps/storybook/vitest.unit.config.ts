import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests should not initialize the Storybook browser project or its presets.
export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: {
      "@orderly.network/net/src": fileURLToPath(
        new URL("../../packages/net/src", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
