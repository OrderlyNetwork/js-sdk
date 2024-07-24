import type { StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box, ModalProvider } from "@orderly.network/ui";
import {
  MaintenanceTipsUI,
  AccountMenuWidget,
  AccountSummaryWidget,
  ChainMenuWidget,
} from "@orderly.network/ui-scaffold";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { CustomConfigStore } from "../../../constants/CustomConfigStore.ts";
import { useState } from "react";
import {
  TradingRewards,
  TradingRewardsLayoutWidget,
} from "@orderly.network/trading-rewards";

const configStore = new CustomConfigStore({ brokerId: "testnet", env: "dev" });

const meta = {
  title: "Package/ui-scaffold/maintenanceTips",
  component: MaintenanceTipsUI,
  subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp
          configStore={configStore}
          brokerId={"orderly"}
          brokerName={"Orderly"}
          networkId={"testnet"}
        >
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

export const Default: Story = {
  args: {
    tipsContent:
      "Orderly will be temporarily unavailable for a scheduled upgrade from 11:30 PM (UTC) on June 28 to 12:30 AM (UTC) on June 29.",
    closeTips: () => {},
    showTips: true,
  },
};

export const SystemMaintenanceStatus: Story = {
  render: () => {
    const [currentPath, setCurrentPath] = useState("trading");

    return (
      <TradingRewardsLayoutWidget
        routerAdapter={{
          onRouteChange: (options) => {
            console.log("options", options);
          },
          currentPath: currentPath,
        }}
      >
        <TradingRewards.HomePage />
      </TradingRewardsLayoutWidget>
    );
  },
};