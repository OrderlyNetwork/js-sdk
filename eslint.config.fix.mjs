import customEslintConfig from "@kodiak-finance/orderly-eslint-config";
import { defineConfig } from "eslint/config";

// this config is used to auto fix eslint rules when commit
export default defineConfig([
  ...customEslintConfig,
  {
    // disable auto fix tailwindcss rules when commit
    rules: {
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/no-contradicting-classname": "off",
      "tailwindcss/enforces-shorthand": "off",
      "tailwindcss/migration-from-tailwind-2": "off",
      "tailwindcss/classnames-order": "off",
      "tailwindcss/enforces-negative-arbitrary-values": "off",
      "tailwindcss/no-arbitrary-value": "off",
      "tailwindcss/no-unnecessary-arbitrary-value": "off",
    },
  },
]);
