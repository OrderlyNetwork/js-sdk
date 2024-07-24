import {useState} from "react";
import type {Meta, StoryObj} from "@storybook/react";
// import { fn } from '@storybook/test';

import {OrderlyApp} from "@orderly.network/react-app";
import {ConnectorProvider} from "@orderly.network/web3-onboard";
// import {CustomConfigStore} from "../CustomConfig Store";
import {TradingPage} from '@orderly.network/trading';
import {Scaffold} from "@orderly.network/ui-scaffold";


const meta = {
    title: "Package/Trading/page",
    component: TradingPage,
    // subcomponents: {
    //     Assets: OverviewModule.AssetWidget,
    //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
    // },
    decorators: [
        (Story: any) => {

// const networkId = localStorage.getItem("preview-orderly-networkId");
            // const networkId = "mainnet";
            const networkId = "testnet";
            // const networkId = "mainnet";
            // const configStore = new CustomConfigStore({networkId, env: "qa"});
            return (
                <ConnectorProvider>
                    <OrderlyApp
                        brokerId={"orderly"}
                        brokerName={"Orderly"}
                        networkId={networkId}
                        onChainChanged={(chainId, isTest) => {
                            console.log("onChainChanged", chainId, isTest)
                        }}
                        // configStore={configStore}
                    >
                        <Scaffold leftSidebar={null}>

                            <Story/>
                        </Scaffold>
                    </OrderlyApp>
                </ConnectorProvider>
            );
        },
    ],
    parameters: {
        layout: "fullscreen",
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    // tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
    argTypes: {},
    args: {
        symbol: "PERP_ETH_USDC",
        tradingViewConfig: {
            scriptSRC: "/tradingview/charting_library/charting_library.js",
            library_path: "/tradingview/charting_library/",
            customCssUrl: "/tradingview/chart.css",
        },
    },
} satisfies Meta<typeof TradingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};


// export const LayoutPage: Story = {}
