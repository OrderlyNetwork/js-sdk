import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ScrollArea } from "@veltodefi/ui";

const meta: Meta<typeof ScrollArea> = {
  title: "Base/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: () => (
    <ScrollArea className="oui-h-[300px] oui-w-[200px]">
      Orderly Network is a combination of an orderbook-based trading
      infrastructure and a robust liquidity layer offering spot and perpetual
      futures orderbooks. Unlike traditional platforms, Orderly doesn’t have a
      front end; instead, it operates at the core of the ecosystem, providing
      essential services to projects built on top of it. Our DEX white-label
      solution is carefully crafted to save builders time and capital while
      granting access to our bootstrapped liquidity. Picture having the best
      features of CEXs while keeping settlements on-chain and maintaining full
      self-custody. With Orderly, anyone can create a trading application thanks
      to our seamless plug-and-play experience leveraging our liquidity and
      composability. Looking ahead, our grand vision is to create an omnichain
      protocol, connecting traders from both EVM and non-EVM chains within the
      same orderbook.
    </ScrollArea>
  ),
};
