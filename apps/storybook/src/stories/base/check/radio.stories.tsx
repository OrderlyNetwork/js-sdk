import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "@orderly.network/ui";

const meta: Meta<typeof Checkbox> = {
  title: "Base/Checkbox/Radio",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "white"],
    },
  },
  args: {
    color: "white",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Radio: Story = {
  render: () => <Checkbox variant="radio" />,
};

export const Primary: Story = {
  render: () => <Checkbox variant="radio" color="primary" />,
};
