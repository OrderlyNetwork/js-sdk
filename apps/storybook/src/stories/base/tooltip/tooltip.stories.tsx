import { Tooltip } from "@orderly.network/ui";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Tooltip> = {
  title: "Base/Tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    return (
      <Tooltip {...args}>
        <button>Hover me</button>
      </Tooltip>
    );
  },
  args: {
    defaultOpen: true,
    // open: true,
    content: "Hello, World!",
  },
};
