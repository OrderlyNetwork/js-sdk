import type { Meta, StoryObj } from "@storybook/react-vite";
import { Checkbox } from "@veltodefi/ui";

const meta: Meta<typeof Checkbox> = {
  title: "Base/Checkbox/Checkbox",
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Primary: Story = {
  render: () => <Checkbox color="primary" />,
};
