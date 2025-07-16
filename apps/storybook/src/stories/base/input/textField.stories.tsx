import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TextField } from "@orderly.network/ui";

const meta: Meta<typeof TextField> = {
  title: "Base/Input/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
  },
  // tags: ['autodocs'],
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["default", "success", "danger", "warning"],
    },
    size: {
      control: {
        type: "inline-radio",
      },
      options: ["mini", "medium", "default", "large"],
    },
    disabled: {
      control: {
        type: "boolean",
      },
    },
    fullWidth: {
      control: {
        type: "boolean",
      },
    },
  },
  args: {
    size: "default",
    label: "Title",
    helpText: "Help Text",
    //   disabled:false,
    //   fullWidth:false,
    onValueChange: fn(),
    onClear: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
