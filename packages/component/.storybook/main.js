/** @type { import('@storybook/react-webpack5').StorybookConfig } */

import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
const config = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions", {
    name: '@storybook/addon-styling',
    options: {
      // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
      // For more details on this addon's options.
      postCss: true
    }
  }, "@storybook/addon-mdx-gfm"],
  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },
  docs: {
    autodocs: "tag"
  },
  webpackFinal: async config => {
    if (config.resolve) {
      config.resolve.plugins = [...(config.resolve.plugins || []), new TsconfigPathsPlugin({
        extensions: config.resolve.extensions
      })];
    }
    return config;
  }
};
export default config;