import type {Meta, StoryObj} from "@storybook/react";
import {OrderlyApp} from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { MarketsHeaderWidget } from '@orderly.network/markets';

const meta = {
    title: "Package/Markets/Header",
    component: MarketsHeaderWidget,
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
} satisfies Meta<typeof MarketsHeaderWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};
