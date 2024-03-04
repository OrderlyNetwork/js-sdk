import { dirname, join } from "path";
/** @type { import('@storybook/react-webpack5').StorybookConfig } */

import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

// import { remarkNpm2Yarn } from 'remark-npm2yarn'

const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-interactions"),
    {
      name: "@storybook/addon-styling",
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: true,
      },
    },
    getAbsolutePath("@storybook/addon-mdx-gfm"),
    {
      name: '@storybook/addon-storysource',
      options: {
        loaderOptions: {
          injectStoryParameters: false,
        },
      },
    },
  ],
  framework: {
    name: getAbsolutePath("@storybook/react-webpack5"),
    options: {
      fastRefresh: true,
    },
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.plugins = [
        ...(config.resolve.plugins || []),
        new TsconfigPathsPlugin({
          extensions: config.resolve.extensions,
          // configFile: path.resolve(__dirname, "../tsconfig.build.json"),
        }),
      ];

      config.resolve.alias = {
        ...config.resolve.alias,
        // "@orderly.network/hooks": path.resolve(__dirname, "../../../packages/hooks/src"),
        // "@orderly.network/component": path.resolve(__dirname, "../../../packages/component/src"),
        // "@orderly.network/referral": path.resolve(__dirname, "../../../packages/referral/src"),
      }
    }
    return config;
  },

  babel: async (config, option) => {
    config.presets = [...config.presets, "@babel/preset-typescript"];
    return config;
  }
};
export default config;

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
