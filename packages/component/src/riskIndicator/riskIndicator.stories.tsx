import type { Meta, StoryObj } from "@storybook/react";

import { RiskIndicator } from "./riskIndicator";

const meta: Meta<typeof RiskIndicator> = {
  component: RiskIndicator,
  title: "Base/RiskIndicator",
};

export default meta;

type Story = StoryObj<typeof RiskIndicator>;

export const Default: Story = {
  args: {
    // width: 100,
    // height: 100,
    value: 10,
  },
};
