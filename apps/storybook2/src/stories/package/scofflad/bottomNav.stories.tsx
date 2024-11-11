import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Box, Flex, ModalProvider } from "@orderly.network/ui";
import {
  AccountMenuWidget,
  FooterWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  Scaffold,
} from "@orderly.network/ui-scaffold";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";

const meta = {
  title: "Package/ui-scaffold/footer",
  component: FooterWidget,
  // subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider
          brokerId={"orderly"}
          brokerName={""}
          networkId={"testnet"}
        >
          <ModalProvider>
            <Box intensity={900}>
              <Story />
            </Box>
          </ModalProvider>
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CumstomizeUrls: Story = {
  render: () => {
    return (
      <Scaffold
        footerConfig={{
          telegramUrl: "https://orderly.network",
          discordmUrl: "https://orderly.network",
          twitterUrl: "https://orderly.network",
        }}
        footer={<FooterWidget />}
      ></Scaffold>
    );
  },
};
