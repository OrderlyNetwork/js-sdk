import type { Meta, StoryObj } from "@storybook/react";
// @ts-ignore
import React from "react";
import { Markets } from ".";
import { OrderlyProvider } from "../../provider";

import { useOrderEntry } from "@orderly/hooks";

const meta: Meta = {
  title: "Block/Markets",
  component: Markets,
  argTypes: {
    onSubmit: { action: "submit" },
    onDeposit: { action: "deposit" },
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

type Story = StoryObj<typeof Markets>;

export const Default: Story = {};
