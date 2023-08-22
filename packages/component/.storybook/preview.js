/** @type { import('@storybook/react').Preview } */
import { withThemeByDataAttribute } from "@storybook/addon-styling";

import "../src/tailwind.css"; // tailwind css

const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    viewport:{
      defaultViewport: 'mobile2'
    }
  },
  globalTypes: {
    symbol: {
      description: "Internationalization locale",
      defaultValue: "PERP_ETH_USDC",
      toolbar: {
        icon: "database",
        items: [
          { value: "PERP_ETH_USDC", title: "PERP_ETH_USDC" },
          { value: "PERP_NEAR_USDC", title: "PERP_NEAR_USDC" },
      
        ],
      },
    },
  },
};

export default preview;

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      // light: "light",
      // dark: "dark",
      "woo/dark": "",
      "woo/light": "woo_light",
      orderly: "orderly",
    },
    defaultTheme: "woo/dark",
    attributeName: "data-o-theme",
  }),
];
