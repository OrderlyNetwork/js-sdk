import type {Meta, StoryObj} from "@storybook/react";
// import { fn } from '@storybook/test';
import {TradingRewards, TradingRewardsLayoutWidget} from "@orderly.network/trading-rewards";

import {OrderlyApp} from "@orderly.network/react-app";
import {ConnectorProvider} from "@orderly.network/web3-onboard";
import { CustomConfigStore } from "../CustomConfigStore";
import { Scaffold } from "@orderly.network/ui-scaffold";

const meta = {
    title: "Package/TradingRewards/IndexPage",
    component: TradingRewards.IndexPage,
    // subcomponents: {
    //     Assets: OverviewModule.AssetWidget,
    //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
    // },
    decorators: [
        (Story: any) => {

// const networkId = localStorage.getItem("preview-orderly-networkId");
      // const networkId = "mainnet";
      const networkId = "testnet";
      const configStore = new CustomConfigStore({ networkId, env: "qa" });
            return (
                <ConnectorProvider>
                    <OrderlyApp 
                    brokerId={"orderly"} 
                    brokerName={"Orderly"} 
                    networkId={networkId} 
                    configStore={configStore}
                >
                     <Story/>
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
    argTypes: {
        //   backgroundColor: { control: 'color' },
        // p: {
        //     control: {
        //         type: "number",
        //         min: 0,
        //         max: 10,
        //         step: 1,
        //     },
        // },
    },
    // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
    args: {
        p: 5,
        // py: 2,
    },
} satisfies Meta<typeof TradingRewards.IndexPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};


  export const LayoutPage: Story = {
    render: (args) => {
      return <TradingRewardsLayoutWidget>
        <TradingRewards.IndexPage />
      </TradingRewardsLayoutWidget>
    },
  }