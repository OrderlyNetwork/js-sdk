import type { Meta } from "@storybook/react";

import { TradingPage } from ".";

const meta: Meta = {
  title: "Page/Trading",
  component: TradingPage,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default = () => <TradingPage />;
