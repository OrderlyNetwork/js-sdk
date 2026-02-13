import { defineConfig } from "eslint/config";
import customEslintConfig from "@orderly.network/eslint-config";

// export default defineConfig(customEslintConfig);

export default defineConfig([
  ...customEslintConfig,
  {
    settings: {
      tailwindcss: {
        config: "./packages/ui/tailwind.config.js",
      },
    },
  },
]);
