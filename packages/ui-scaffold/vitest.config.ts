import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Alias the workspace dependency to its source so this package's tests do not
// depend on a fresh `dist` build of ui-notification (see apps/storybook/
// vitest.announcement.config.ts, which does the same for the announcement suite).
export default defineConfig({
  resolve: {
    alias: {
      "@orderly.network/ui-notification": fileURLToPath(
        new URL("../../packages/ui-notification/src/index.ts", import.meta.url),
      ),
    },
  },
  esbuild: { jsx: "automatic" },
});
