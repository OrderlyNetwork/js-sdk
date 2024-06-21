import type {Meta, StoryObj} from "@storybook/react";
// import { fn } from '@storybook/test';
import {OverviewModule,} from "@orderly.network/portfolio";

import {OrderlyApp} from "@orderly.network/react-app";
import {Box, Card} from "@orderly.network/ui";
import {fn} from "@storybook/test";
import {ConnectorProvider} from "@orderly.network/web3-onboard";

const meta = {
    title: "Package/Portfolio/OverviewPage",
    component: OverviewModule.OverviewPage,
    subcomponents: {
        Assets: OverviewModule.AssetWidget,
        DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
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
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: "centered",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    // tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {
        //   backgroundColor: { control: 'color' },
        p: {
            control: {
                type: "number",
                min: 0,
                max: 10,
                step: 1,
            },
        },
    },
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {
        p: 5,
        // py: 2,
    },
} satisfies Meta<typeof OverviewModule.OverviewPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};

export const Assets: Story = {
    render: (args) => {
        return <OverviewModule.AssetWidget {...args} />;
    },
    args: {
        // connected: false,
        // onConnectWallet: fn(),
        // onWithdraw: fn(),
        // onDeposit: fn(),
        // onLeverageEdit: fn(),
    },
    decorators: [
        (Story) => (
            <Box width={"500px"}>
                <Story/>
            </Box>
        ),
    ],
};

export const AssetHistory: Story = {
    render: (args) => {
        return <OverviewModule.AssetHistoryWidget></OverviewModule.AssetHistoryWidget>
    },

    decorators: [
        (Story) => (
            <Card intensity={900}>
                <Story/>
            </Card>
        ),
    ],

}

export const Performance: Story = {
    render: (args) => {
        return <OverviewModule.PerformanceWidget></OverviewModule.PerformanceWidget>
    },

    decorators: [
        (Story) => (
            <Box width={'880px'}>
                <Story/>
            </Box>
        ),
    ],
}

export const AssetHistoryChart: Story = {
    render: (args) => {
        return <OverviewModule.AssetsChartWidget></OverviewModule.AssetsChartWidget>
    },

    decorators: [
        (Story) => (
            <Box width={'580px'}>
                <Story/>
            </Box>
        ),
    ],
}
