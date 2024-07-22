import type {Meta, StoryObj} from "@storybook/react";
import {OrderlyApp} from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { WithdrawFormWidget } from '@orderly.network/withdraw';

const meta = {
    title: "Package/Withdraw",
    component: WithdrawFormWidget,
    subcomponents: {
       
    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId="orderly" brokerName="Orderly" networkId="testnet" >
                    <Story/>
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],   
} satisfies Meta<typeof WithdrawFormWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithdrawForm: Story = {};
