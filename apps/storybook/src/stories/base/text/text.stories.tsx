import type { Meta, StoryObj } from "@storybook/react";
import { Flex, Text } from "@orderly.network/ui";

const meta: Meta<typeof Text> = {
  title: "Base/Typography/Text",
  component: Text,
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
        "neutral",
        "profit",
        "lose",
      ],
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

export const Default: Story = {
  args: {
    children: "One DEX to rule all chains",
  },
};

export const Sizes: Story = {
  render: (args) => {
    return (
      <Flex direction="column">
        <Text {...args} size="3xs">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="2xs">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="xs">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="sm">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="base">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="lg">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="xl">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="2xl">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="3xl">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="4xl">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="5xl">
          One DEX to rule all chains
        </Text>
        <Text {...args} size="6xl">
          One DEX to rule all chains
        </Text>
      </Flex>
    );
  },
  args: {},
};

export const Intensity: Story = {
  render: (args) => {
    return (
      <Flex gapX={2} direction={"column"}>
        <Text {...args} intensity={12}>
          Orderly network
        </Text>
        <Text {...args} intensity={20}>
          Orderly network
        </Text>
        <Text {...args} intensity={36}>
          Orderly network
        </Text>
        <Text {...args} intensity={54}>
          Orderly network
        </Text>
        <Text {...args} intensity={80}>
          Orderly network
        </Text>
        <Text {...args} intensity={98}>
          Orderly network
        </Text>
      </Flex>
    );
  },
};

export const Gradient: Story = {
  render: (args) => {
    return <Text.gradient {...args} >One DEX to rule all chains</Text.gradient>;
  },
  args: {
    color: "brand",
  },
  argTypes: {
    color: {
      control: {
        type: "inline-radio",
      },
      options: ["primary", "brand", "neutral", "warning", "danger", "success"],
    },
    angle: {
      control: {
        type: "range",
        min: 0,
        max: 360,
        step: 1,
      },
    },
  },
};
