import type { Meta, StoryObj } from "@storybook/react";

import { Tooltip } from ".";
import React from "react";
import { OrderlyProvider } from "../provider";

const meta: Meta<typeof Tooltip> = {
  component: Tooltip,
  title: "Base/Tooltip",
  argTypes: {},
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider configStore={undefined}>
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: (args) => (
    <Tooltip content="Quantity should be less or equal to your max Buy.">
      <button>Tooltip trigger</button>
    </Tooltip>
  ),
  args: {
    // label: "Take profit / Stop loss",
  },
};
