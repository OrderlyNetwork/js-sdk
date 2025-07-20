import React from "react";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { withThemeBuilder } from "../src/addons/theme_tool/preview";
import { OrderlyProvider } from "../src/components/orderlyProvider";
import { customViewports } from "./screenSizes";
import "../src/tailwind.css";

const preview: Preview = {
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider>
          <Story />
        </OrderlyProvider>
      );
    },
    withThemeBuilder,
    // https://github.com/storybookjs/storybook/blob/next/code/addons/themes/docs/getting-started/tailwind.md#%EF%B8%8F-using-a-data-attribute-for-theme
    withThemeByDataAttribute({
      themes: {
        orderly: "orderly",
        custom: "custom",
        roundless: "roundless",
      },
      defaultTheme: import.meta.env.VITE_DEFAULT_THEME || "orderly",
      attributeName: "data-oui-theme",
    }),
  ],
  // tags: ["autodocs"],
  parameters: {
    // custom background colors: http://localhost:6008/?path=/story/package-trading-leaderboard--campaign-leaderboard&globals=theme:custom
    // backgrounds: {
    //   options: [
    //     { name: "Dark", value: "rgb(var(--oui-color-base-10))" },
    //     { name: "Light", value: "rgb(255,255,255)" },
    //   ],
    //   default: "Dark",
    // },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    docs: {
      codePanel: true,
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
      options: customViewports,
    },
  },
};

export default preview;
