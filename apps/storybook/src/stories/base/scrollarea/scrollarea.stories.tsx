import { ScrollArea } from "@orderly.network/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta: Meta<typeof ScrollArea> = {
  title: "Base/ScrollArea",
  component: ScrollArea,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
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
