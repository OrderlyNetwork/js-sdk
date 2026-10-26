import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Node-only: this suite never starts Playwright or opens a browser.
export default defineConfig({
  resolve: {
    alias: {
      "@testing-library/react": createRequire(import.meta.url).resolve(
        "@testing-library/react",
      ),
      "@orderly.network/ui-notification": fileURLToPath(
        new URL("../../packages/ui-notification/src/index.ts", import.meta.url),
      ),
    },
  },
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: [
      "../../packages/ui-notification/src/utils/cardSelection.test.ts",
      "../../packages/ui-notification/src/utils/bellAnnouncements.test.ts",
      "../../packages/ui-notification/src/components/announcementCenter/**/*.test.tsx",
      "../../packages/ui-notification/src/articles/**/*.test.{ts,tsx}",
      "../../packages/ui-notification/src/pages/**/*.test.{ts,tsx}",
      "../../packages/ui-scaffold/src/components/messageCenter/selectMessages.test.ts",
      "../../packages/ui-scaffold/src/components/scaffold/useSharedAnnouncementState.test.tsx",
    ],
  },
});
