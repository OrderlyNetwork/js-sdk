import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { Either } from "@orderly.network/ui";

const meta = {
  title: "Base/misc/Either",
  component: Either,
  //   subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  //   tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    value: {
      type: "boolean",
    },
  },
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
