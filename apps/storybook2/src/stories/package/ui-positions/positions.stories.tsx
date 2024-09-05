import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';

import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
// import { Button, modal } from "@orderly.network/ui";
import { limitCloseConfirm, LimitCloseDialogId, LimitDialog, PositionsWidget } from '@orderly.network/ui-positions';
import { Box, Button, Flex, modal } from "@orderly.network/ui";
import { OrderSide } from "@orderly.network/types";

const meta = {
  title: "Package/ui-positions/list",
  component: PositionsWidget,
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
    layout: "fullscreen",
  },

  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    sharePnLConfig: {
      backgroundImages: [
        "/pnl/poster_bg_1.png",
        "/pnl/poster_bg_2.png",
        "/pnl/poster_bg_3.png",
        "/pnl/poster_bg_4.png",
        "/pnl/poster_bg_5.png",
      ],
      color: "rgba(255, 255, 255, 0.98)",
      profitColor: "rgba(255,68,124,1)",
      lossColor: "rgba(0,180,158,1)",
      brandColor: "rgba(51,95,252,1)",

      // ref
      refLink: "https://orderly.network",
      refSlogan: "NEW BE",
    }
  },
} satisfies Meta<typeof PositionsWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaut: Story = {
  decorators: [
    (Stroy) => <Box height={'360px'}>{Stroy()}</Box >
  ]
};

export const LimitCloseDialog: Story = {
  render: (args) => {
    return <Flex justify={'center'} pt={6}>
      <Box width={'320px'} intensity={800} r="md" p={4}><LimitDialog  {...args}/></Box>
    </Flex>
  },
  args: {
    symbol: 'PERP_ETH_USDC',
    quantity: 0.11,
    price: 1000,
    total: 110.356,
    side: OrderSide.SELL
  }
}

export const LimitCloseDialogCommandStyle: Story = {
  render: (args) => {
    return <Flex justify={'center'}>
      <Button onClick={()=>{
        limitCloseConfirm(
          args,
          {
         
          onOk: ()=>Promise.resolve().then(()=>console.log('ok')),
          onCancel: ()=>Promise.resolve().then(()=>console.log('cancel'))
        })
      }}>Limit close position</Button>
    </Flex>
  },
  args: {
    symbol: 'PERP_ETH_USDC',
    quantity: 0.11,
    price: 1000,
    total: 110.356,
    side: OrderSide.SELL
  }
}