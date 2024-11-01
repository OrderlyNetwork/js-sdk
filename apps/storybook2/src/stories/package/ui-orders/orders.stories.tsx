import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';

import { OrderlyApp } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
// import { Button, modal } from "@orderly.network/ui";
import { OrdersWidget, TabType } from '@orderly.network/ui-orders';
import { Card, Flex, Text, Divider } from "@orderly.network/ui";
import { PortfolioLayoutWidget } from "@orderly.network/portfolio";


const meta = {
  title: "Package/ui-orders/widget",
  component: OrdersWidget,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },
  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={"Orderly"} networkId={"testnet"}>
          <Story />
        </OrderlyApp>
      </WalletConnectorProvider>
    ),
  ],
  parameters: {
    // layout: "centered",
  },

  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
  },
} satisfies Meta<typeof OrdersWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaut: Story = {
  render: (arg) => {
    return <OrdersWidget current={TabType.pending} />
  }
};


export const Layout: Story = {
  render: (arg) => {


    return (
      <PortfolioLayoutWidget>
        <Flex
          p={6}
          direction={"column"}
          gap={4} width={"100"}
          height={"100%"}
          itemAlign={"start"}
          r="2xl"
          className="oui-bg-base-9 oui-font-semibold"
        >
          <Text size="lg">Orders</Text>
          <Divider  className="oui-w-full" />
          <OrdersWidget current={TabType.rejected} />
        </Flex>
      </PortfolioLayoutWidget>
    );
  }
}