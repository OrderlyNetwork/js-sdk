import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { TokenIcon, Icon, Flex } from "@orderly.network/ui";

const meta = {
  title: "Base/Icon/CoinIcon",
  component: TokenIcon,
  //   subcomponents: { SelectItem },
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
    name: "BTC",
  },
};

export const TokenIcons: Story = {
  render: (args) => {
    return (
      <Flex gap={2}>
        <TokenIcon {...args} name="BTC" />
        <TokenIcon {...args} name="ETH" />
        <TokenIcon {...args} name="USDT" />
        <TokenIcon {...args} name="USDC" />
        <TokenIcon {...args} name="DAI" />
      </Flex>
    );
  },
};

export const CombineIcon: Story = {
  render: (args) => {
    return (
      <Flex gap={3} wrap={"wrap"}>
        <Icon.combine
          secondary={{
            name: "ETH",
          }}
        >
          <TokenIcon {...args} name="BTC" />
        </Icon.combine>
      </Flex>
    );
  },
};
