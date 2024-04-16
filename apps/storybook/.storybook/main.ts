import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";
import { StorybookConfig } from "@storybook/react-webpack5";
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
    "@storybook/addon-styling-webpack"
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
    if (config.resolve) {
      config.resolve.plugins = [
        ...(config.resolve.plugins || []),
        new TsconfigPathsPlugin({
          extensions: config.resolve.extensions,
          // custom tsconfig
          configFile: path.resolve(__dirname, "../tsconfig.build.json"),
        }),
      ];

      config.resolve.alias = {
        ...config.resolve.alias,
        // "@orderly.network/hooks": path.resolve(__dirname, "../../../packages/hooks/src"),
        // "@orderly.network/react": path.resolve(
        //   __dirname,
        //   "../../../packages/component/src"
        // ),
        "@orderly.network/referral": path.resolve(
          __dirname,
          "../../../packages/referral/src"
        ),
      };

      // if (config.module) {
      //   config.module.rules.push({
      //     test: /\.css$/,
      //     use: [
      //       'style-loader',
      //       'css-loader',
      //       {
      //         loader: 'postcss-loader',
      //         options: {
      //           postcssOptions: {
      //             ident: 'postcss',
      //             plugin: [
      //               require('tailwindcss'),
      //               require('autoprefixer'),
      //             ]
      //           }
      //         }
      //       }
      //     ]
      //   });
      // }
    }
    return config;
  },

  babel: async (config, option) => {
    config.presets = [...config.presets!, "@babel/preset-typescript"];
    return config;
  },
};
export default config;
