import React from "react";
import type { Preview } from "@storybook/react";
import { withThemeByClassName } from "@storybook/addon-themes";
import { customViewports } from "./screenSizes";
import OrderlyProvider from "./orderlyProvider";
import "../src/tailwind.css";

export const decorators = [
  withThemeByClassName({
    themes: {
      light: "light",
      dark: "dark",
    },
    defaultTheme: "dark",
  }),
];

const preview: Preview = {
  decorators: [
    (Story: any) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      values: [
        { name: "Dark", value: "#07080A" },
        { name: "Light", value: "#07080A" },
      ],
      default: "Dark",
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    options: {
      storySort: {
        order: [
          "Overview",
          "Base",
          "Package",
          [
            "ui-scaffold",
            "ui-connector",
            "ui-chain-selector",
            "ui-order-entry",
            "ui-orders",
            "ui-positions",
            "ui-tpsl",
            "ui-transfer",
            "ui-share",
            "ui-leverage",
            "ui-tradingview",
            "trading",
            "portfolio",
            "markets",
            "affiliate",
            "trading-rewards",
          ],
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
