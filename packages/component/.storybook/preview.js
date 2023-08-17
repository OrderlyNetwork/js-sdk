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
    // viewport:{
    //   defaultViewport: 'largeMobile'
    // }
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
