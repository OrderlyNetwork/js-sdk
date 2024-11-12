import type { Meta, StoryObj } from "@storybook/react";
import { Button, modal } from "@orderly.network/ui";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { Scaffold } from "@orderly.network/ui-scaffold";
import { DepositAndWithdrawWithDialogId } from "@orderly.network/ui-transfer";
import {
  APIManagerModule,
  PortfolioLayoutWidget,
} from "@orderly.network/portfolio";
import { CustomConfigStore } from "../../../components/configStore/customConfigStore";

const configStore = new CustomConfigStore({
  networkId: "testnet",
  env: "qa",
  brokerId: "orderly",
  brokerName: "Orderly",
});

const meta: Meta<typeof Scaffold> = {
  title: "Package/solana/connect",
  component: Scaffold,
  decorators: [
    (Story: any) => (
      <WalletConnectorProvider>
        <OrderlyAppProvider configStore={configStore}>
          <Story />
        </OrderlyAppProvider>
      </WalletConnectorProvider>
    ),
  ],
  argTypes: {},
  args: {
    leftSideProps: {
      className:
        "oui-border oui-border-line-12 oui-m-4 oui-p-3 oui-rounded-lg oui-h-[calc(100vh_-_180px)]",
    },
  },
};

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
  args: {
    children: (
      <Button
        onClick={() => {
          modal.show(DepositAndWithdrawWithDialogId, { activeTab: "deposit" });
        }}
      >
        Show Deposit Dialog
      </Button>
    ),
  },
};

export const APIKey: Story = {
  args: {
    children: (
      <PortfolioLayoutWidget>
        <APIManagerModule.APIManagerPage />
      </PortfolioLayoutWidget>
    ),
  },
};
