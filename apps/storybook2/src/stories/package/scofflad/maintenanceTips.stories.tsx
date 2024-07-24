import type { StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { Box, ModalProvider } from "@orderly.network/ui";
import {
  Scaffold,
  MaintenanceTipsWidget,
  MaintenanceTipsUI,
} from "@orderly.network/ui-scaffold";
import { ConnectorProvider } from "@orderly.network/web3-onboard";

const meta = {
  title: "Package/ui-scaffold/maintenanceTips",
  component: MaintenanceTipsUI,
  // subComponents: { AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget },
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story: any) => (
      <ConnectorProvider>
        <OrderlyApp
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
  args: {
    tipsContent:
      "Orderly will be temporarily unavailable for a scheduled upgrade from 11:30 PM (UTC) on June 28 to 12:30 AM (UTC) on June 29.",
    closeTips: () => {},
    showTips: true,
  },
  render: () => {
    return (
      <Scaffold>
        <MaintenanceTipsWidget />
      </Scaffold>
    );
  },
};
