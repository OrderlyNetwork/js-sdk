import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { PositionsWidget } from "@orderly.network/ui-positions";
import { Box, Button, modal } from "@orderly.network/ui";

const meta: Meta<typeof PositionsWidget> = {
  title: "Package/ui-positions/list",
  component: PositionsWidget,
  // subcomponents: {
  //     Assets: OverviewModule.AssetWidget,
  //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
  // },

  decorators: [
    (Story) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId="orderly"
          brokerName="Orderly"
          networkId="testnet"
        >
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
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
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Defaut: Story = {
  decorators: [(Stroy) => <Box height={"360px"}>{Stroy()}</Box>],
};

export const MarketClose: Story = {
  render: () => {
    return (
      <Button
        onClick={() => {
          modal.show("MarketCloseConfirmID", {
            base: "ETH",
            quantity: 222.22,
            onConfirm: async () => {
              return Promise.resolve(0);
            },
            submitting: false,
          });
        }}
      >
        Show market close
      </Button>
    );
  },
};
