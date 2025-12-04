import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "@veltodefi/ui";

const meta: Meta<typeof Spinner> = {
  title: "Base/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "success", "danger", "warning"],
    },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["nano", "mini", "medium", "default", "large"],
    },
  },
  args: {
    // size:'default'
    color: "primary",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
