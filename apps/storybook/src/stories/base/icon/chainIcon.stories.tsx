import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { ChainIcon, Flex } from "@orderly.network/ui";

const meta = {
  title: "Base/Icon/ChainIcon",
  component: ChainIcon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["sm", "md", "lg"],
      control: { type: "inline-radio" },
    },
  },
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
