import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { ChainIcon, Flex } from "@orderly.network/ui";

const meta = {
  title: "Base/Icon/ChainIcon",
  component: ChainIcon,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "inline-radio" },
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    chainId: "1",
  },
};

export const ChainIcons: Story = {
  render: (args) => {
    return (
      <Flex gap={2}>
        <ChainIcon {...args} chainId="1" />
        <ChainIcon {...args} chainId="43114" />
        <ChainIcon {...args} chainId="137" />
        <ChainIcon {...args} chainId="56" />
        <ChainIcon {...args} chainId="250" />
      </Flex>
    );
  },
};
