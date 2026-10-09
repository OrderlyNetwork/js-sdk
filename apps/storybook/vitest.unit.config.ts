import { defineConfig } from "vitest/config";

// Unit tests should not initialize the Storybook browser project or its presets.
export default defineConfig({
  resolve: { dedupe: ["react", "react-dom"] },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
