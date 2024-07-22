import type {Meta, StoryObj} from "@storybook/react";
import {OrderlyApp} from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { DepositFormWidget } from '@orderly.network/deposit';

const meta = {
    title: "Package/Deposit",
    component: DepositFormWidget,
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
} satisfies Meta<typeof DepositFormWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const DepositForm: Story = {};
