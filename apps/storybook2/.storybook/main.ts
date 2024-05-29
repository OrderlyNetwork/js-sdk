// import type { StorybookConfig } from "@storybook/react-vite";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

import type { StorybookConfig } from "@storybook/react-webpack5";

import { join, dirname, resolve } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-onboarding"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-interactions"),
    "@storybook/addon-webpack5-compiler-swc",
    // "@storybook/addon-styling-webpack",
    {
      name: "@storybook/addon-styling-webpack",
      options: {
        rules: [
          // Replaces existing CSS rules to support PostCSS
          {
            test: /\.css$/,
            use: [
              "style-loader",
              {
                loader: "css-loader",
                options: { importLoaders: 1 },
              },
              {
                // Gets options from `postcss.config.js` in your project root
                loader: "postcss-loader",
                options: { implementation: require.resolve("postcss") },
              },
            ],
          },
        ],
      },
    },
    "@storybook/addon-themes",
  ],
  // framework: "@storybook/react-webpack5",
  // framework: {
  //   name: getAbsolutePath("@storybook/react-vite"),
  //   options: {},
  // },
  framework: {
    name: "@storybook/react-webpack5",
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  swc: (config) => ({
    ...config,
    jsc: {
      transform: {
        react: {
          runtime: "automatic",
        },
      },
    },
  }),
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
          configFile: resolve(__dirname, "../tsconfig.json"),
        }),
      ];

      config.resolve.alias = {
        ...config.resolve.alias,
        // "@orderly.network/hooks": path.resolve(__dirname, "../../../packages/hooks/src"),
        // "@orderly.network/react": path.resolve(
        //   __dirname,
        //   "../../../packages/component/src"
        // ),
        "@orderly.network/ui": resolve(__dirname, "../../../packages/ui/src"),
        "@orderly.network/react": resolve(
          __dirname,
          "../../../packages/component/src"
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
};
export default config;
