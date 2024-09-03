import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { SharePnLDialogWidget, SharePnLDialogId, SharePnLBottomSheetId } from '@orderly.network/ui-share';
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { Button, Flex, modal } from "@orderly.network/ui";

const meta = {
  title: "Package/ui-share/SharePnL",
  component: SharePnLDialogWidget,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },
  decorators: [
    (Story) => (
      <ConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>

          <Story />

        </OrderlyApp>
      </ConnectorProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  // tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    //   backgroundColor: { control: 'color' },
    // p: {
    //     control: {
    //         type: "number",
    //         min: 0,
    //         max: 10,
    //         step: 1,
    //     },
    // },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    pnl: {
      position: {
        "symbol": "PERP_ETH_USDC",
        "position_qty": -0.0794,
        "cost_position": -187.802286,
        "last_sum_unitary_funding": 1558.09,
        "pending_long_qty": 0.023,
        "pending_short_qty": 0.0,
        "settle_price": 2365.26808564,
        "average_open_price": 2518.74,
        "unsettled_pnl": -12.191228,
        "mark_price": 2518.81,
        "est_liq_price": 55213.84417678,
        "timestamp": 1725345164501,
        "imr": 0.05,
        "mmr": 0.012,
        "IMR_withdraw_orders": 0.05,
        "MMR_with_orders": 0.012,
        "pnl_24_h": 0.0,
        "fee_24_h": 0.119993
      },
      leverage: 10,
      // ref
      refCode: "AADB",
      refSlogan: "NEW BE",
      refLink: "www.orderly.network",
      backgroundImages: [
        "/pnl/poster_bg_1.png",
        "/pnl/poster_bg_2.png",
        "/pnl/poster_bg_3.png",
        "/pnl/poster_bg_4.png",
        "/pnl/poster_bg_5.png",
      ],
      color: "rgba(255, 255, 255, 0.98)",
      profitColor: "rgb(255,0,0)",
      lossColor: "rgb(0,0,255)",
      brandColor: "rgb(0,181,159)",
    }
  },
} satisfies Meta<typeof SharePnLDialogWidget>;

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


export const CommandStyle: Story = {
  render: (arg) => {
    const { pnl } = arg;
    console.log("xxxx pnl config", arg);

    return <Flex direction={"column"} gap={2}>
      <Button onClick={() => {
        modal.show(SharePnLDialogId, { pnl });
      }}>Share PnL (Desktop)</Button>
      <Button onClick={() => {
        modal.show(SharePnLBottomSheetId);
      }}>Share PnL (mWeb)</Button>
    </Flex>
  },
}