import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "@veltodefi/ui";

const meta = {
  title: "Base/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "success", "danger", "warning"],
    },
    variant: {
      control: {
        type: "inline-radio",
      },
      options: ["contained", "text"],
    },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["sm", "md", "lg"],
    },
  },
  args: {
    color: "primary",
    variant: "contained",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};
