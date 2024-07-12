import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box, Flex, ModalProvider } from "@orderly.network/ui";
import {
  AccountMenuWidget,
  FooterWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
  Scaffold,
} from "@orderly.network/ui-scaffold";
import { ConnectorProvider } from "@orderly.network/web3-onboard";

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
      <ConnectorProvider>
        <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
          <ModalProvider>
            <Box intensity={900}>
              <Story />
            </Box>
          </ModalProvider>
        </OrderlyApp>
      </ConnectorProvider>
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
