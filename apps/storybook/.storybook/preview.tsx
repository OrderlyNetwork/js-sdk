import React from "react";
import type { Preview } from "@storybook/react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { customViewports } from "./screenSizes";
import {OrderlyProvider} from "./orderlyProvider";
import { withThemeBuilder } from "../src/addons/theme_tool/preview";

import "../src/tailwind.css";

const preview: Preview = {
  decorators: [
    (Story: any, context: any) => {
      return (
        <OrderlyProvider>
          <Story />
        </OrderlyProvider>
      );
    },
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
        { name: "Light", value: "rgb(255,255,255)" },
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
          "Design Tokens",
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
