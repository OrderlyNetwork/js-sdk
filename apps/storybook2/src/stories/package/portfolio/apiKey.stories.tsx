import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  APIManagerModule,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";

const meta: Meta<typeof APIManagerModule.APIManagerPage> = {
  title: "Package/Portfolio/APIKey",
  component: APIManagerModule.APIManagerPage,
  subcomponents: {},
  decorators: [
    (Story: any) => {
      return (
        <WalletConnectorProvider>
          <OrderlyAppProvider
            brokerId="orderly"
            brokerName="Orderly"
            networkId="testnet"
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
