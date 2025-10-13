import { Box } from "@kodiak-finance/orderly-ui";
import { AccountMenuWidget } from "@kodiak-finance/orderly-ui-scaffold";
import { TradingviewWidget } from "@kodiak-finance/orderly-ui-tradingview";
import type { Meta, StoryObj } from "@storybook/react-vite";

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
