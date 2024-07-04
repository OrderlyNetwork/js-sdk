import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";

import "../src/tailwind.css";
import { withWalletConnect } from "./addons/withWalletConnect";
import { customViewports } from "./screenSizes";

export const decorators = [
  withThemeByClassName({
    themes: {
      light: "light",
      dark: "dark",
    },
    defaultTheme: "light",
  }),
  withWalletConnect,
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Design Tokens",
          "Base",
          ["Overview"],
          "Package",
          ["Overview", "ui-connector", "ui-leverage", "ui-scaffold"],
        ],
      },
    },
    viewport: {
      viewports: {
        // ...INITIAL_VIEWPORTS,
        // ...MINIMAL_VIEWPORTS,
        ...customViewports,
      },
      // defaultViewport: 'iphone6 PRO',
    },
  },
};

export default preview;
