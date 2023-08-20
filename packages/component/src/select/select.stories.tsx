import type { Meta, StoryObj } from "@storybook/react";

import { Picker, Select } from ".";

const meta: Meta<typeof Select> = {
  component: Select,
  title: "Base/Select",
  args: {
    label: "Order Type",
    options: [
      { label: "Option 1", value: "option1" },
      { label: "Option 2", value: "option2" },
      { label: "Option 3", value: "option3" },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    size: "default",
    label: "Select",
    placeholder: "Select",
  },
};

export const PickerStyle: Story = {
  render: (args) => {
    return <Picker {...args} fullWidth />;
  },
};

export const WithValue: Story = {
  render: (args) => {
    return <Select {...args} value={"option2"} />;
  },
};
