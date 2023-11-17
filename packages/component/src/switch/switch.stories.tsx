import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
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

export const Colors: Story = {
  render: (args) => {
    return (
      <div className="orderly-flex orderly-gap-5">
        <Switch {...args} />
        <Switch checked {...args} />
        <Switch checked color="profit" {...args} />
        <Switch checked color="loss" {...args} />
      </div>
    );
  },
};
