import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { LeverageView } from ".";
import { useFundingRate } from "@orderly.network/hooks";
import { OrderlyProvider } from "../../provider";
import { MemoryConfigStore } from "@orderly.network/core";

const meta: Meta<typeof LeverageView> = {
  component: LeverageView,
  title: "Block/LeverageView",
  args: {
    maxLeverage: 10,
    predFundingRate: -0.001,
    countdown: "00:00:00",
  },
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider configStore={new MemoryConfigStore()}>
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof LeverageView>;

export const Default: Story = {};

export const WithHooks: Story = {
  render: (args, { globals }) => {
    const data = useFundingRate(globals.symbol);

    return (
      <LeverageView
        {...args}
        countdown={data.countDown}
        predFundingRate={data.est_funding_rate}
      />
    );
  },
};
