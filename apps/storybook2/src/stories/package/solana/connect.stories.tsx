import type {Meta, StoryObj} from "@storybook/react";
import {Box, Button, modal} from "@orderly.network/ui";
import {WalletConnectorProvider} from "@orderly.network/wallet-connector";
import {OrderlyApp} from "@orderly.network/react-app";
import {AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget, Scaffold} from "@orderly.network/ui-scaffold";
import {CustomConfigStore} from "../CustomConfigStore.ts";
import {DepositAndWithdrawWithDialogId} from "@orderly.network/ui-transfer";
import {APIManagerModule, PortfolioLayoutWidget} from "@orderly.network/portfolio";

const networkId = "testnet";

const configStore = new CustomConfigStore({networkId, env: "qa", brokerName: 'WOOFiPRO', brokerId: 'woofi_pro'});

const meta = {

    title: "Package/solana/connect",
    component: WalletConnectorProvider,
    decorators: [
        (Story: any) => (
            <WalletConnectorProvider>
                <OrderlyApp
                    brokerId={"woofi_pro"}
                    brokerName={"WOOFiPRO"}
                    networkId={"testnet"}
                    configStore={configStore}
                >
                    <Story/>

                </OrderlyApp>
            </WalletConnectorProvider>
        ),
    ],
    argTypes: {},
    args: {
        leftSideProps: {
            className:
                "oui-border oui-border-line-12 oui-m-4 oui-p-3 oui-rounded-lg oui-h-[calc(100vh_-_180px)]",
        },
    }
}

type Story = StoryObj<typeof meta>;

export default meta;

export const Default: Story = {
    args: {
        children: (
            <Scaffold>

                <Button onClick={() => {
                    modal.show(DepositAndWithdrawWithDialogId, {activeTab: 'deposit'})

                }}>Show Deposit Dialog</Button>
            </Scaffold>
        ),
    },
};

export const APIKey: Story = {
    args: {
        children: (
            <PortfolioLayoutWidget>
                <APIManagerModule.ApiManagerPage />
            </PortfolioLayoutWidget>
        )
    }
}
