import type { Meta, StoryObj } from "@storybook/react";

import { MSelect } from "./mSelect";

const meta: Meta = {
  title: "Base/MobileSelect",
  component: MSelect,
  //   parameters: {
  //     layout: "fullscreen",
  //   },
};

export default meta;

type Story = StoryObj<typeof MSelect>;

export const Default: Story = {
  args: {
    fullWidth: true,
    value: 1,
    options: [
      {
        label: "Limit Order",
        value: 1,
      },
      {
        label: "Market Order",
        value: 2,
      },
    ],
  },
  // description: "Description",
};
