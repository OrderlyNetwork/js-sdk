import { StorybookConfig } from "@storybook/react-webpack5";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import path from "path";

// import { remarkNpm2Yarn } from 'remark-npm2yarn'

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: "@storybook/addon-styling",
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: true,
      },
    },
    "@storybook/addon-mdx-gfm",
    {
      name: "@storybook/addon-storysource",
      options: {
        loaderOptions: {
          injectStoryParameters: false,
        },
      },
    },
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {
      fastRefresh: true,
    },
  },
  docs: {
    autodocs: "tag",
  },
  webpackFinal: async (config) => {
    // console.log("webpackFinal", config);
    if (config.resolve) {
      config.resolve.plugins = [
        ...(config.resolve.plugins || []),
        new TsconfigPathsPlugin({
          extensions: config.resolve.extensions,
          // custom tsconfig
          configFile: path.resolve(__dirname, "../tsconfig.build.json"),
        }),
      ];

      // custom alias
      config.resolve.alias = {
        ...config.resolve.alias,
        "@orderly.network/hooks": path.resolve(__dirname, "../../hooks/src"),
        // "@orderly.network/core": path.resolve(__dirname, "../../core/src"),
      };
    }
    return config;
  },
  babel: async (config, option) => {
    config.presets = [...config.presets!, "@babel/preset-typescript"];
    return config;
  },
};
export default config;
