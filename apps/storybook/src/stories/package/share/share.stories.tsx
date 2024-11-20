import type { Meta, StoryObj } from "@storybook/react";
import {
  SharePnLDialogWidget,
  SharePnLDialogId,
  SharePnLBottomSheetId,
  SharePnLBottomSheetWidget,
} from "@orderly.network/ui-share";
import { Button, Flex, modal } from "@orderly.network/ui";
import config from "../../../config";

const meta: Meta<typeof SharePnLDialogWidget> = {
  title: "Package/ui-share/SharePnL",
  component: SharePnLDialogWidget,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },
  parameters: {
    layout: "centered",
  },
  argTypes: {},
  args: {
    pnl: {
      position: {
        symbol: "PERP_ETH_USDC",
        position_qty: 0.0794,
        cost_position: -187.802286,
        last_sum_unitary_funding: 1558.09,
        pending_long_qty: 0.023,
        pending_short_qty: 0.0,
        settle_price: 2365.26808564,
        average_open_price: 2518.74,
        unsettled_pnl: -12.191228,
        mark_price: 2518.81,
        est_liq_price: 55213.84417678,
        timestamp: 1725345164501,
        imr: 0.05,
        mmr: 0.012,
        IMR_withdraw_orders: 0.05,
        MMR_with_orders: 0.012,
        pnl_24_h: 0.0,
        fee_24_h: 0.119993,
        unrealized_pnl: 20,
        unrealized_pnl_ROI: 1.22,
      },
      leverage: 10,
      ...config.tradingPage.sharePnLConfig,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
  decorators: [
    (Story) => (
      <Flex style={{ width: "624px" }} direction={"column"}>
        <Story />
      </Flex>
    ),
  ],
};

export const Mobile: Story = {
  render: (arg) => {
    return (
      <Flex style={{ width: "375px" }} direction={"column"}>
        <SharePnLBottomSheetWidget pnl={arg.pnl} />
      </Flex>
    );
  },
};

export const CommandStyle: Story = {
  render: (arg) => {
    const { pnl } = arg;
    console.log("xxxx pnl config", arg);

    return (
      <Flex direction={"column"} gap={2}>
        <Button
          onClick={() => {
            modal.show(SharePnLDialogId, { pnl });
          }}
        >
          Share PnL (Desktop)
        </Button>
        <Button
          onClick={() => {
            modal.show(SharePnLBottomSheetId, { pnl });
          }}
        >
          Share PnL (mWeb)
        </Button>
      </Flex>
    );
  },
};
