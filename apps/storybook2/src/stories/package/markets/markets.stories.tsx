import type {Meta, StoryObj} from "@storybook/react";
import {OrderlyApp} from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { MarketsHeader } from '@orderly.network/markets';

const meta = {
    title: "Package/Markets/Header",
    component: MarketsHeader,
    subcomponents: {
       
    },
    decorators: [
        (Story: any) => (
            <ConnectorProvider>
                <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
                    <Story/>
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],   
} satisfies Meta<typeof MarketsHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};
