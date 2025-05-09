/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  semi: true,
  tabWidth: 2,
  singleQuote: false,
  plugins: [
    "@trivago/prettier-plugin-sort-imports",
    // "prettier-plugin-tailwindcss",
  ],
  // tailwindConfig: "./packages/ui/tailwind.config.js",
  // tailwindFunctions: ["cn", "cnBase"],
  importOrder: [
    "^react$",
    "^react",
    "<THIRD_PARTY_MODULES>",
    "^@orderly.network/(?!.*\\.css$)(.*)$",
    "^@orderly.network/ui(?!.*\\.css$)(.*)$",
    "^@/(?!.*\\.css$)(.*)$",
    "^[./](?!.*\\.css$)",
    "^.*\\.css$",
  ],
};

export default config;
