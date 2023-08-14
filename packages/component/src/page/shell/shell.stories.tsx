import React from "react";
import type { Meta } from "@storybook/react";

import { WooPage } from "./woo";
import { OrderlyProvider } from "../../provider/orderlyProvider";

const meta: Meta = {
  title: "App/Woo",
  component: WooPage,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <OrderlyProvider>
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

export const Default = () => <WooPage />;
