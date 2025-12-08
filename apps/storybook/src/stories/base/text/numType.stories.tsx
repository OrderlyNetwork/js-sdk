import { Flex, Grid, Text } from "@orderly.network/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta: Meta<typeof Text.roi> = {
  title: "Base/Typography/NumType",
  component: Text.roi,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
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
    dp: {
      control: {
        type: "number",
        min: 0,
        max: 10,
        step: 1,
      },
    },
    coloring: {
      control: {
        type: "boolean",
      },
    },
  },
  args: {
    size: "base",
    weight: "regular",
    color: "primary",
    dp: 2,
    coloring: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const allTypesNumList = [
  123, 1234, 123.123, 1234.567, -123, -1234, -123.123, -1234.567, 0,
];

const allTypesComponents = [
  { key: "roi", label: "ROI:", Component: Text.roi },
  { key: "pnl", label: "PNL:", Component: Text.pnl },
  { key: "notional", label: "Notional:", Component: Text.notional },
  {
    key: "assetValue",
    label: "Asset Value:",
    Component: Text.assetValue,
  },
  {
    key: "collateral",
    label: "Collateral:",
    Component: Text.collateral,
  },
];

export const Default: Story = {
  args: {
    children: 1234.567,
  },
  render: (args) => {
    return <Text.roi {...args} />;
  },
};

const roiNumList = [
  0.123456, -0.123456, 1.234, 12.34, -0.1234, -0.01234, -1.234, -12.34, 0,
];

export const ROI: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          ROI (Return on Investment)
        </Text>
        {roiNumList.map((data, index) => (
          <Grid key={index} cols={2} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {data}
            </Text>
            <Text.roi
              coloring
              rule="percentages"
              size="sm"
              weight="semibold"
              prefix={"("}
              suffix={")"}
            >
              {data}
            </Text.roi>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};

const pnlNumList = [123.45, 1234.56, 12345.67, -123.45, -1234.56, -12345.67, 0];

export const PNL: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          PNL (Profit and Loss)
        </Text>
        {pnlNumList.map((data, index) => (
          <Grid key={index} cols={2} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {data}
            </Text>
            <Text.pnl {...args} coloring>
              {data}
            </Text.pnl>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};

const notionalNumList = [
  123.45, 1234.56, 12345.67, 123456.78, -123.45, -1234.56, 0,
];

export const Notional: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          Notional Value
        </Text>
        {notionalNumList.map((data, index) => (
          <Grid key={index} cols={2} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {data}
            </Text>
            <Text.notional {...args} coloring>
              {data}
            </Text.notional>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};

const assetValueNumList = [
  123.45, 1234.56, 12345.67, 123456.78, -123.45, -1234.56, 0,
];

export const AssetValue: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          Asset Value
        </Text>
        {assetValueNumList.map((data, index) => (
          <Grid key={index} cols={2} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {data}
            </Text>
            <Text.assetValue {...args} coloring>
              {data}
            </Text.assetValue>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};

const collateralNumList = [
  123.45, 1234.56, 12345.67, 123456.78, -123.45, -1234.56, 0,
];

export const Collateral: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          Collateral
        </Text>
        {collateralNumList.map((data, index) => (
          <Grid key={index} cols={2} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {data}
            </Text>
            <Text.collateral {...args} coloring>
              {data}
            </Text.collateral>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};

const decimalPlacesNumList = [123.456789, -123.456789, 0.123456789];
const dpList = [0, 2, 4, 6, 8];

export const DecimalPlaces: Story = {
  render: (args: any) => {
    const colsCount = dpList.length + 1;
    return (
      <Flex direction={"column"} gapY={4} width={400} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          不同小数位数 (dp)
        </Text>
        {decimalPlacesNumList.map((data, dataIndex) => (
          <Flex key={dataIndex} direction={"column"} gapY={2} width={"100%"}>
            <Text weight="semibold" size="sm" color="secondary">
              原始值: {data}
            </Text>
            <Grid cols={colsCount as any} gapX={2} gapY={1} width={"100%"}>
              <Text size="sm" color="tertiary">
                dp
              </Text>
              {dpList.map((dp) => (
                <Text key={dp} size="sm" color="tertiary">
                  {dp}
                </Text>
              ))}
            </Grid>
            <Grid cols={colsCount as any} gapX={2} gapY={1} width={"100%"}>
              <Text size="sm" color="secondary">
                ROI
              </Text>
              {dpList.map((dp) => (
                <Text.roi key={dp} {...args} dp={dp}>
                  {data}
                </Text.roi>
              ))}
            </Grid>
            <Grid cols={colsCount as any} gapX={2} gapY={1} width={"100%"}>
              <Text size="sm" color="secondary">
                PNL
              </Text>
              {dpList.map((dp) => (
                <Text.pnl key={dp} {...args} dp={dp} coloring>
                  {data}
                </Text.pnl>
              ))}
            </Grid>
          </Flex>
        ))}
      </Flex>
    );
  },
  args: {},
};

const sizesList = [
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
];

export const Sizes: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          不同尺寸
        </Text>
        {sizesList.map((size) => (
          <Grid key={size} cols={2} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {size}
            </Text>
            <Text.roi {...args} size={size as any} coloring>
              1234.567
            </Text.roi>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};

const colorsList = [
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
];

export const Colors: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={2} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          不同颜色
        </Text>
        {colorsList.map((color) => (
          <Grid key={color} cols={2} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {color}
            </Text>
            <Text.roi {...args} color={color as any}>
              1234.567
            </Text.roi>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};

const withColoringNumList = [123.45, -123.45, 0];

export const WithColoring: Story = {
  render: (args: any) => {
    return (
      <Flex direction={"column"} gapY={4} width={300} itemAlign={"start"}>
        <Text weight="semibold" size="lg" color="primary">
          自动颜色 (coloring)
        </Text>
        <Grid cols={3} gapX={2} gapY={1} width={"100%"}>
          <Text size="sm" color="secondary">
            值
          </Text>
          <Text size="sm" color="secondary">
            无 coloring
          </Text>
          <Text size="sm" color="secondary">
            有 coloring
          </Text>
        </Grid>
        {withColoringNumList.map((data, index) => (
          <Grid key={index} cols={3} gapX={2} width={"100%"}>
            <Text size="sm" color="tertiary">
              {data}
            </Text>
            <Text.roi {...args} coloring={false}>
              {data}
            </Text.roi>
            <Text.roi {...args} coloring={true}>
              {data}
            </Text.roi>
          </Grid>
        ))}
      </Flex>
    );
  },
  args: {},
};
