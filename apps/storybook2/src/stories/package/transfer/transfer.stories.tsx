import type { Meta, StoryObj } from "@storybook/react";
import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { DepositFormWidget } from '@orderly.network/ui-transfer';
import { Box, Flex } from "@orderly.network/ui";
import { CustomConfigStore } from "../CustomConfigStore";

const networkId = "mainnet";
const configStore = new CustomConfigStore({ networkId, env: "staging" });


const meta = {
    title: "Package/ui-transfer",
    component: DepositFormWidget,
    subcomponents: {

    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId="orderly" brokerName="Orderly" networkId="mainnet" configStore={configStore} >
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
