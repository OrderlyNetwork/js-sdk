import stylistic from "@stylistic/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import tailwind from "eslint-plugin-tailwindcss";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import { dirname } from "path";
import path from "path";
import ts from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig([
  globalIgnores([
    "**/build/",
    "**/dist/",
    "**/node_modules/",
    "**/public/",
    "**/__test__/",
    "**/storybook-static/",
    "packages/component/",
    "apps/docs/",
    "**/*.js",
    "**/*.cjs",
    "**/*.d.ts",
  ]),
  {
    languageOptions: {
      // parser: typescriptEslintParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },
  // add eslint built-in
  // https://github.com/eslint/eslint/blob/main/packages/js/src/configs/eslint-recommended.js
  // js.configs.recommended,

  // add `typescript-eslint` flat config simply
  // if you would like use more another configuration,
  // see the section: https://typescript-eslint.io/getting-started#details
  // https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/src/configs/eslintrc/recommended.ts
  ...ts.configs.recommended,

  // https://github.com/francoismassart/eslint-plugin-tailwindcss
  // https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/master/lib/config/flat-recommended.js
  ...tailwind.configs["flat/recommended"],

  // https://github.com/vercel/turborepo/blob/main/packages/eslint-config-turbo/src/flat/index.ts
  // ...turboConfig,

  // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/index.js#L108
  reactPlugin.configs.flat.recommended,
  // Add this if you are using React 17+
  reactPlugin.configs.flat["jsx-runtime"],
  {
    files: ["**/*.{ts,tsx}"],
    // ignores: ["dist/**", "build/**", "node_modules/**"],
    plugins: {
      // https://eslint.style/packages/default
      "@stylistic": stylistic,
    },
    rules: {
      // "@stylistic/semi": ["error", "never"],
      "prefer-const": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unnecessary-type-constraint": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "warn",
      "@typescript-eslint/no-namespace": "warn",
      "react/prop-types": "off",
      "react/display-name": "warn",
      "react/no-children-prop": "warn",
      "tailwindcss/no-custom-classname": "off",
    },
  },

  eslintConfigPrettier,
  {
    settings: {
      react: {
        version: "18.2",
      },
      // https://github.com/francoismassart/eslint-plugin-tailwindcss/tree/master/docs/rules
      tailwindcss: {
        callees: ["classnames", "cnBase", "cn"],
        config: path.resolve(__dirname, "../ui/tailwind.config.js"),
        // default
        cssFiles: [
          "**/*.css",
          "!**/node_modules",
          "!**/.*",
          "!**/dist",
          "!**/build",
        ],
        cssFilesRefreshRate: 5_000,
        removeDuplicates: true,
        skipClassAttribute: false,
        whitelist: [],
        // can be set to e.g. ['tw'] for use in tw`bg-blue`
        tags: [],
        // can be modified to support custom attributes. E.g. "^tw$" for `twin.macro`
        classRegex: "^class(Name)?$",
      },
    },
  },
]);
