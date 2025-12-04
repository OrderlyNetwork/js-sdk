import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flex, Grid, Text } from "@veltodefi/ui";

const meta: Meta<typeof Text> = {
  title: "Base/Typography/Text",
  component: Text,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
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
    return <Text.gradient {...args}>One DEX to rule all chains</Text.gradient>;
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

export const NumType: Story = {
  render: (args) => {
    const numList = [
      123, 1234, 123.123, 1234.567, -123, -1234, -123.123, -1234.567,
    ];
    const numTypes = [
      { key: "roi", label: "ROI:", Component: Text.roi },
      { key: "pnl", label: "PNL:", Component: Text.pnl },
      { key: "notional", label: "Notional:", Component: Text.notional },
      { key: "assetValue", label: "Asset Value:", Component: Text.assetValue },
      { key: "collateral", label: "Collateral:", Component: Text.collateral },
    ];

    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        {numTypes.map(({ key, label, Component }) => (
          <>
            <Text weight="semibold" size="lg" color="primary">
              {label}
            </Text>
            {numList.map((data, index) => (
              <Grid key={`${key}-${index}`} cols={3} gapX={2} width={"100%"}>
                <Text>{data}</Text>
                {">>"}
                <Component color="primary">{data}</Component>
              </Grid>
            ))}
          </>
        ))}
      </Flex>
    );
  },
  args: {},
};
