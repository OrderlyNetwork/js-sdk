import type { Meta, StoryObj } from "@storybook/react";
import { APIManagerModule } from "@orderly.network/portfolio";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box } from "@orderly.network/ui";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { PortfolioLayout } from "../../../../../../packages/portfolio/src/layout/layout.ui";
import { CustomConfigStore } from "../CustomConfigStore";

const meta = {
  title: "Package/Portfolio/APIKey",
  component: APIManagerModule.ApiManagerPage,
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
        <ConnectorProvider>
          <OrderlyApp
            brokerId={"orderly"}
            brokerName={"Orderly"}
            networkId={networkId}
            // configStore={configStore}
          >
            <Story />
          </OrderlyApp>
        </ConnectorProvider>
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
      <PortfolioLayout items={[]}>
        <APIManagerModule.ApiManagerPage />
      </PortfolioLayout>
    );
  },
};
