import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { DepositFormWidget, WithdrawFormWidget, DepositAndWithdrawWithDialogId } from '@orderly.network/ui-transfer';
import { Box, Flex, Button, modal } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import {customChains} from "./customChains.ts";

// const networkId = "mainnet";
const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "staging", brokerName: 'Orderly', brokerId: 'orderly' });


const meta = {
    title: "Package/ui-transfer",
    component: DepositFormWidget,
    subcomponents: {

    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId="orderly" brokerName="Orderly" networkId={networkId}
                            customChains={customChains as any}
                            configStore={configStore} appIcons={{
                    main: {
                        img: "/orderly-logo.svg",
                    },
                    secondary: {
                        img: "/orderly-logo-secondary.svg",
                    },
                }}>
                    <Story />
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],
} satisfies Meta<typeof DepositFormWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DepositForm: Story = {
    decorators: [
        (Story) => (
            <Flex justify='center' mt={10}>
                <Box width={420} intensity={800} p={5} r="lg">
                    <Story />
                </Box>
            </Flex>
        ),
    ],
};

export const WithdrawForm: Story = {
    render: () => {
        return <Flex justify='center' mt={10}>
            <Box width={420} intensity={800} p={5} r="lg">
                <WithdrawFormWidget/>
            </Box>
        </Flex>
    }
}


export const DepositDialog: Story = {
    decorators: [
        (Story) => (
            <Flex justify='center' itemAlign='center' height="100vh">
                <Button onClick={() => {
                    modal.show(DepositAndWithdrawWithDialogId, { activeTab: 'deposit' })

                }}>Show Deposit Dialog</Button>
            </Flex>
        ),
    ],
};

export const WithdrawDialog: Story = {
    decorators: [
        (Story) => (
            <Flex justify='center' itemAlign='center' height="100vh">
                <Button onClick={() => {
                    modal.show(DepositAndWithdrawWithDialogId, { activeTab: 'withdraw' })

                }}>Show Withdraw Dialog</Button>
            </Flex>
        ),
    ],
};