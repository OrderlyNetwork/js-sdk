import type { Meta, StoryObj } from "@storybook/react";
import { TradingviewWidget } from "@orderly.network/ui-tradingview";
import { Box } from "@orderly.network/ui";
import { AccountMenuWidget } from "@orderly.network/ui-scaffold";

const meta: Meta<typeof TradingviewWidget> = {
  title: "Package/ui-tradingview/buySellOnTradingview",
  component: TradingviewWidget,
  decorators: [
    (Story) => (
      <>
        <AccountMenuWidget />
        <Box height={600}>
          <Story />
        </Box>
      </>
    ),
  ],
  parameters: {},

  args: {
    symbol: "PERP_BTC_USDC",
  },
};

type Story = StoryObj<typeof meta>;

export default meta;
