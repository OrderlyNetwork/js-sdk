import type { StorybookConfig } from "@storybook/react-vite";

// import { join, dirname, resolve } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 * When configuring addons in Storybook v9, getAbsolutePath is usually not required.
 */
// function getAbsolutePath(value: string): any {
//   return dirname(require.resolve(join(value, "package.json")));
// }

function getStories() {
  const defaultStories = [
    "../src/**/*.mdx",
    "../src/stories/**/*.mdx",
    "../src/documentation/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ];

  // need to use process.env instead of import.meta.env
  const pages = process.env.VITE_STORYBOOK_PAGES;

  if (pages) {
    const list = pages.split(",").map((item) => item.trim());

    const map = {
      trading:
        "../src/stories/package/trading/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      portfolio:
        "../src/stories/package/portfolio/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      markets:
        "../src/stories/package/markets/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      affiliate:
        "../src/stories/package/affiliate/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      rewards:
        "../src/stories/package/trading-rewards/**/*.stories.@(js|jsx|mjs|ts|tsx)",
      leaderboard:
        "../src/stories/package/trading-leaderboard/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    };

    return list.map((item) => map[item as keyof typeof map]).filter(Boolean);
  }

  return defaultStories;
}

const config: StorybookConfig = {
  stories: getStories(),
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
    "@storybook/addon-themes",
    "@storybook/addon-links",
    "../src/addons/theme_tool/register.ts",
    // "../src/addons/walletConnect/register.ts",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    reactDocgen: "react-docgen-typescript",
  },
  core: {
    // https://storybook.js.org/telemetry
    disableTelemetry: true,
  },
  // custom build options: https://storybook.js.org/docs/api/main-config/main-config-build
  // build: {
  //   test: {
  //     disableBlocks: false,
  //     disabledAddons: [],
  //     disableMDXEntries: false,
  //     disableAutoDocs: false,
  //     disableDocgen: false,
  //     disableSourcemaps: true,
  //     disableTreeShaking: false,
  //   },
  // },
};
export default config;
