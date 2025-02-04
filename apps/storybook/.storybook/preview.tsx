import React from "react";
import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { customViewports } from "./screenSizes";
import OrderlyProvider from "./orderlyProvider";
import "../src/tailwind.css";
import { withThemeBuilder } from "./addons/themeBuilder/preview";

const preview: Preview = {
  decorators: [
    (Story: any) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
    withThemeBuilder,
    withThemeByDataAttribute({
      themes: {
        orderly: "orderly",
        custom: "custom",
        roundless: "roundless",
      },
      defaultTheme: "orderly",
      attributeName: "data-oui-theme",
    }),
  ],
  tags: ["autodocs"],
  parameters: {
    backgrounds: {
      values: [
        { name: "Dark", value: "rgb(var(--oui-color-base-10))" },
        { name: "Light", value: "rgb(var(--oui-color-base-10))" },
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
