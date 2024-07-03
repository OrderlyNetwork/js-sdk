import { Box, MainNav, Logo } from "@orderly.network/ui";
import type { Meta, StoryObj } from "@storybook/react";
import { useArgs } from "@storybook/preview-api";
import { fn } from "@storybook/test";
// import { MainNav} from '@orderly.network/react';

const meta = {
  title: "Widget/Navigation/MainNav",
  component: MainNav,
  subComponents: { Logo },
  parameters: {
    //   // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    // p: 5,
    // py: 2,
    items: [
      { name: "Trading", href: "/" },
      { name: "Portfolio", href: "/portfolio" },
    ],
    current: "/",
    onItemClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [{ current }, updateArgs] = useArgs();
    return (
      <MainNav
        {...args}
        current={current}
        onItemClick={(item) => {
          updateArgs({ current: item.href });
        }}
        products={{
          ...args.products,
          onItemClick: (item) => {
            updateArgs({
              products: {
                ...args.products,
                current: item.id,
              },
            });
          },
        }}
      />
    );
  },
  args: {
    logo: {
      src: "https://testnet-dex-evm.woo.org/images/woofipro.svg",
      alt: "woofipro",
    },
    products: {
      products: [
        { name: "Swap", id: "swap" },
        { name: "Trade", id: "trade" },
      ],
      current: "swap",
    },
  },
  decorators: [
    (Story) => (
      <Box intensity={900}>
        <Story />
      </Box>
    ),
  ],
};
