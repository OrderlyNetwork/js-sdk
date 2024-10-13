import type {Meta, StoryObj} from "@storybook/react";
import {Box, Button, modal} from "@orderly.network/ui";
import {WalletConnectorProvider} from "@orderly.network/wallet-connector";
import {OrderlyApp} from "@orderly.network/react-app";
import {AccountMenuWidget, AccountSummaryWidget, ChainMenuWidget, Scaffold} from "@orderly.network/ui-scaffold";
import {CustomConfigStore} from "../CustomConfigStore.ts";
import {DepositAndWithdrawWithDialogId} from "@orderly.network/ui-transfer";

const networkId = "testnet";

const configStore = new CustomConfigStore({networkId, env: "qa", brokerName: 'WOOFiPRO', brokerId: 'woofi_pro'});

const meta = {

    title: "Package/solana/connect",
    component: Scaffold,
    subComponents: {
        AccountMenuWidget,
        AccountSummaryWidget,
        ChainMenuWidget,
        // ChainMenu,
    },
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
            <Box m={3} justify={"center"} height={"400px"} intensity={500} r={"lg"}>
                <Button onClick={() => {
                    modal.show(DepositAndWithdrawWithDialogId, {activeTab: 'deposit'})

                }}>Show Deposit Dialog</Button>
            </Box>
        ),
    },
};
