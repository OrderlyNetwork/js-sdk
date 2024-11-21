import type { Meta, StoryObj } from "@storybook/react";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { Box } from "@orderly.network/ui";
import { Scaffold } from "@orderly.network/ui-scaffold";

const meta: Meta<typeof TradingviewWidget> = {
  title: "Package/ui-tradingview",
  component: TradingviewWidget,
  decorators: [
    (Story) => (
      <Scaffold>
        <Box height={600}>
          <Story />
        </Box>
      </Scaffold>
    ),
  ],
  parameters: {},
  args: {
    symbol: "PERP_BTC_USDC",
  },
};

type Story = StoryObj<typeof meta>;

export default meta;

const tradingviewProps = {
  symbol: "PERP_ETH_USDC",
  scriptSRC: "/tradingview/charting_library/charting_library.js",
  libraryPath: "/tradingview/charting_library/",
  customCssUrl: "/tradingview/chart.css",
};

export const Default: Story = {
  args: {
    ...tradingviewProps,
  },
};

export const NoTradingviewFile: Story = {
  render: () => {
    return <TradingviewWidget symbol="PERP_BTC_USDC" />;
  },
};
