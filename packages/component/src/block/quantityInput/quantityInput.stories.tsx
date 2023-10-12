import type { Meta, StoryObj } from "@storybook/react";
import { QuantityInput } from ".";

const meta: Meta<typeof QuantityInput> = {
  component: QuantityInput,
  title: "Block/QuantityInput",
  argTypes: {
    onValueChange: { action: "onValueChange" },
  },
  args: {
    tokens: [
      {
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        symbol: "ETH",
        decimals: 18,
        swap_enable: true,
      },
      {
        address: "0x4200000000000000000000000000000000000006",
        symbol: "ETH",
        decimals: 18,
        swap_enable: true,
      },
      {
        address: "0x925AFA2318825FCAC673Ef4eF551208b125dd965",
        symbol: "BTC",
        decimals: 8,
        swap_enable: true,
      },
      {
        address: "0x778098Cd30D96De369aF1cD726a3079fcF437B8f",
        symbol: "WOO",
        decimals: 18,
        swap_enable: true,
      },
      {
        address: "0xa2101FD320D06e0A744e4FE90ef8A20ECd027001",
        symbol: "USDT",
        decimals: 6,
        swap_enable: true,
      },
      {
        address: "0x2e668Bb88287675e34c8dF82686dfd0b7F0c0383",
        symbol: "USDC",
        decimals: 6,
        swap_enable: true,
      },
      {
        address: "0x5C8ef0FA2b094276520D25dEf4725F93467227bC",
        symbol: "sgUSDC",
        decimals: 6,
        swap_enable: true,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof QuantityInput>;

export const Default: Story = {};
