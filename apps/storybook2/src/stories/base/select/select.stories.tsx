import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Select, SelectItem } from "@orderly.network/ui";

const meta = {
  title: "Base/Select",
  component: Select,
  subcomponents: { SelectItem },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    size: {
      options: ["xs", "sm", "md", "lg", "xl"],
      control: { type: "inline-radio" },
    },
    variant: {
      options: ["contained", "outlined", "text"],
      control: { type: "inline-radio" },
    },
  },
  args: {
    size: "md",
    error: false,
    disabled: false,
    variant: "outlined",
    // open: true,
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
      </>
    ),
    value: "apple",
  },
};

export const WithOptions: Story = {
  render: (args) => {
    return <Select.options {...args} />;
  },
  args: {
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Blueberry", value: "blueberry" },
      { label: "Grapes", value: "grapes" },
    ],
    value: "apple",
  },
};
export const Filter: Story = {
  render: (args) => {
    return <Select.combine {...args} />;
  },
  args: {
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Blueberry", value: "blueberry" },
      { label: "Grapes", value: "grapes" },
    ],
    value: "apple",
  },
};

export const Chains: Story = {
  render: (args) => {
    return <Select.chains {...args} />;
  },
  args: {
    size: "md",
    error: false,
    currentChain: {
      name: "ETH",
      id: 1,
    },
    chains: [
      {
        name: "ETH",
        id: 1,
      },
    ],
  },
};

export const Combine: Story = {
  render: (args) => {
    return <Select.combine {...args} />;
  },
  args: {
    options: [
      { label: "Apple", value: "apple" },
      { label: "Banana", value: "banana" },
      { label: "Blueberry", value: "blueberry" },
      { label: "Grapes", value: "grapes" },
    ],
    value: "apple",
  },
};

export const Tokens: Story = {
  render: (args) => {
    return <Select.tokens {...args} />;
  },
  args: {
    size: "md",
    error: false,
    value: "ETH",
    className: "oui-min-w-40",
    tokens: [
      {
        name: "BTC",
      },
      {
        name: "ETH",
      },
    ],
  },
};
