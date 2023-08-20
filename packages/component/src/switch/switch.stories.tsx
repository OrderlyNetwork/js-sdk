import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from ".";

const meta: Meta<typeof Switch> = {
  component: Switch,
  title: "Base/Switch",
  argTypes: {
    onCheckedChange: { action: "checkedChange" },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  // render: (args) => <Switch label="Take profit / Stop loss" {...args} />,
  args: {
    // label: "Take profit / Stop loss",
  },
};
