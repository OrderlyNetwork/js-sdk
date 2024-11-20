import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { Either } from "@orderly.network/ui";

const meta = {
  title: "Base/misc/Either",
  component: Either,
  //   subcomponents: { SelectItem },
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  //   tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    value: {
      type: "boolean",
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: false,
    left: <div>Not connected</div>,
    children: <div>Connected</div>,
  },
};
