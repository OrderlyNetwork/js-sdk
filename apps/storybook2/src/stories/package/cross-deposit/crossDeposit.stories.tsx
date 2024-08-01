import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { CrossDepositFormWidget,  } from '@orderly.network/ui-cross-deposit';
import { Box, Flex, Button, modal } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";
import { customChains } from "./customChains";
import { DepositAndWithdrawWithDialogId } from "@orderly.network/ui-transfer";
import { initDeposit } from "./initDeposit";
initDeposit()

const networkId = "mainnet";
// const networkId = "testnet";
const configStore = new CustomConfigStore({ networkId, env: "prod", brokerName: 'Woofi Pro', brokerId: 'woofi_pro' });


const meta = {
    title: "Package/ui-cross-deposit",
    component: CrossDepositFormWidget,
    subcomponents: {

    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId="orderly" brokerName="Orderly" networkId={networkId} configStore={configStore} appIcons={{
                    main: {
                        img: "/orderly-logo.svg",
                    },
                    secondary: {
                        img: "/orderly-logo-secondary.svg",
                    },
                }}
                customChains={customChains as any}>
                    <Story />
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],
} satisfies Meta<typeof CrossDepositFormWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CrossDepositForm: Story = {
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


<<<<<<< Updated upstream
=======

export const CrossDepositDialog: Story = {
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
>>>>>>> Stashed changes
