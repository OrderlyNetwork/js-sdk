import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { TextField } from "@orderly.network/ui";

const meta: Meta<typeof TextField> = {
  title: "Base/input/TextField",
  component: TextField,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
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
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
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
