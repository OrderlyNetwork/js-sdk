import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { CoinIcon, Icon, Flex } from "@orderly.network/ui";

const meta = {
  title: "Base/Icon/CoinIcon",
  component: CoinIcon,
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

export const CoinIcons: Story = {
  render: (args) => {
    return (
      <Flex gap={2}>
        <CoinIcon {...args} name="BTC" />
        <CoinIcon {...args} name="ETH" />
        <CoinIcon {...args} name="USDT" />
        <CoinIcon {...args} name="USDC" />
        <CoinIcon {...args} name="DAI" />
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
          <CoinIcon {...args} name="BTC" />
        </Icon.combine>
      </Flex>
    );
  },
};
