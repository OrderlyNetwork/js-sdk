import type {Meta, StoryObj} from "@storybook/react";
// import { fn } from '@storybook/test';

import {OrderlyApp} from "@orderly.network/react-app";
import {ConnectorProvider} from "@orderly.network/web3-onboard";
// import { Button, modal } from "@orderly.network/ui";
import {TPSLWidget} from '@orderly.network/ui-positions';
import {Box} from "@orderly.network/ui";

const meta = {
    title: "Package/ui-positions/tpsl",
    component: TPSLWidget,
    // subcomponents: {
    //     Assets: OverviewModule.AssetWidget,
    //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
    // },
    decorators: [
        (Story) => (
            <ConnectorProvider>
                <OrderlyApp brokerId={"orderly"} brokerName={""} networkId={"testnet"}>
                    <Story/>
                </OrderlyApp>
            </ConnectorProvider>
        ),
    ],
    parameters: {
        layout: "centered",
    },

    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {},
} satisfies Meta<typeof TPSLWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    decorators: [
        (Stroy) => <Box width={'360px'} p={5} intensity={800} r={'lg'}>{Stroy()}</Box>
    ]
};
