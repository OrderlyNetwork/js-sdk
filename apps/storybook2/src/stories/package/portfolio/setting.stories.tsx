import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  PortfolioLayoutWidget,
  SettingModule,
} from "@orderly.network/portfolio";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore";

const meta = {
  title: "Package/Portfolio/setting",
  component: SettingModule.SettingPage,
  subcomponents: {},
  decorators: [
    (Story: any) => {
      const configStore = new CustomConfigStore({
        networkId: "testnet",
        brokerId: "orderly",
        brokerName: "Orderly",
        env: "qa",
      });
      return (
        <WalletConnectorProvider>
          <OrderlyAppProvider configStore={configStore}>
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
  render: () => {
    const [currentPath, setCurrentPath] = useState("/portfolio/apiKey");
    return (
      <PortfolioLayoutWidget
        // items={[]}
        routerAdapter={{
          onRouteChange: (op) => {
            console.log("routerAdapter", op);
            setCurrentPath(op.href);
          },
          // currentPath: currentPath
        }}
        leftSideProps={{
          current: currentPath,
        }}
      >
        <SettingModule.SettingPage />
      </PortfolioLayoutWidget>
    );
  },
};
