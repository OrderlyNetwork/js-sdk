import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { Text, QuestionFillIcon, Flex } from "@orderly.network/ui";

const { formatted: FormattedText } = Text;

const meta: Meta<typeof FormattedText> = {
  title: "Base/Typography/Formatted",
  component: FormattedText,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    size: {
      // type:'enum',
      control: {
        type: "inline-radio",
      },
      options: [
        "3xs",
        "2xs",
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
        "5xl",
        "6xl",
      ],
    },
    color: {
      control: {
        type: "inline-radio",
      },
      options: [
        "primary",
        "secondary",
        "tertiary",
        "warning",
        "danger",
        "success",
        "buy",
        "sell",
      ],
    },

    rule: {
      control: {
        type: "inline-radio",
      },
      options: ["date", "address", "symbol"],
    },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    size: "base",
    weight: "regular",
    color: "primary",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DateText: Story = {
  args: {
    rule: "date",
    children: "Sat May 11 2024 15:34:38 GMT+0800 (China Standard Time)",
    formatString: "yyyy-MM-dd HH:mm:ss",
  },
};

export const AddressText: Story = {
  args: {
    rule: "address",
    children: "0x7c3409F33545E069083B4F7386b966d997488Dc1",
    range: [6, 6],
    prefix: <QuestionFillIcon />,
  },
};

export const SymbolText: Story = {
  args: {
    rule: "symbol",
    formatString: "base-quote",
    children: "PERP_ETH_USDC",
  },
};

export const Copyable: Story = {
  args: {
    rule: "address",
    children: "0x7c3409F33545E069083B4F7386b966d997488Dc1",
    range: [6, 6],
    copyable: true,
  },
};
