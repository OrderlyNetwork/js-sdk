import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  APIManagerModule,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";
import { CustomConfigStore } from "@orderly.network/hooks";

const meta: Meta<typeof APIManagerModule.APIManagerPage> = {
  title: "Package/Portfolio/APIKey",
  component: APIManagerModule.APIManagerPage,
  subcomponents: {},
  decorators: [
    (Story: any) => {
      const networkId = "testnet";
      const configStore = new CustomConfigStore({
        networkId,
        brokerId: "woofi_pro",
        env: "qa",
      });
      return (
        <WalletConnectorProvider>
          <OrderlyAppProvider
            brokerId={"orderly"}
            brokerName={"Orderly"}
            networkId={networkId}
            // configStore={configStore}
          >
            <Story />
          </OrderlyAppProvider>
        </WalletConnectorProvider>
      );
    },
  ],
  parameters: {
    // layout: "centered",
  },
  argTypes: {},
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const Layout: Story = {
  render: (e) => {
    return (
      <PortfolioLayoutWidget>
        <APIManagerModule.APIManagerPage />
      </PortfolioLayoutWidget>
    );
  },
};
