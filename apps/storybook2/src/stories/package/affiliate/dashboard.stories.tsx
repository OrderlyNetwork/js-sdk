import type { Meta, StoryObj } from "@storybook/react";
// import { fn } from '@storybook/test';
import { Dashboard, ReferralProvider } from "@orderly.network/affiliate";

import { OrderlyApp } from "@orderly.network/react-app";
import { ConnectorProvider } from "@orderly.network/web3-onboard";
import { CustomConfigStore } from "../CustomConfigStore";
import { TradingRewardsLayoutWidget } from "@orderly.network/trading-rewards";

const meta = {
    title: "Package/Affiliate/Dashboard",
    component: Dashboard.DashboardPage,
    // subcomponents: {
    //     Assets: OverviewModule.AssetWidget,
    //     DepositsAndWithdrawWidget: OverviewModule.AssetHistoryWidget,
    // },
    decorators: [
        (Story: any) => {

            // const networkId = localStorage.getItem("preview-orderly-networkId");
            // const networkId = "mainnet";
            const networkId = "testnet";
            const configStore = new CustomConfigStore({ networkId, brokerId: "woofi_pro", env: "qa" });
            return (
                <ConnectorProvider>
                    <OrderlyApp
                        brokerId={"orderly"}
                        brokerName={"Orderly"}
                        networkId={networkId}
                        configStore={configStore}
                    >
                        <ReferralProvider
                            becomeAnAffiliateUrl="https://orderly.network"
                            learnAffiliateUrl="https://orderly.network"
                            referralLinkUrl="https://ordely.network"
                            showReferralPage={() => {
                                console.log("show referral page");

                            }}
                            // onEnterAffiliatePage={() => {
                            //     console.log("show affiliate page");
                            // }}

                            // onEnterTraderPage={() => {
                            //     console.log("show trader page");

                            // }}
                            // chartConfig={
                            //   {
                            //     trader: { 
                            //       bar: { ...InitialBarStyle, fill: "#00B49E", columnPadding: 20 } 
                            //     },
                            //     affiliate: { 
                            //       bar: { ...InitialBarStyle, fill: "#608CFF", columnPadding: 20 } 
                            //     },
                            //   }
                            // }
                            // intl={
                            // {
                            // messages,
                            // }
                            // }
                            splashPage={() => (<div style={{ backgroundColor: "#FF0000" }}>df</div>)}
                            overwrite={
                                {
                                    shortBrokerName: "Mark",
                                    brokerName: "Mark Pan",
                                    ref: {
                                        // top: (state) =>  (<div>ASD</div>),
                                        // card: (state) => (<div>GFHJK</div>)
                                        // card: {
                                        // refClassName: "orderly-text-red-900",
                                        // refIcon: (<div className="orderly-bg-white orderly-h-full">DDS</div>),
                                        // ref: (state) => (<div>gdjsj</div>)

                                        // traderClassName: "orderly-text-red-900",
                                        // traderIcon: (<div className="orderly-bg-white orderly-h-full">DDS</div>),
                                        // trader: (state) => (<div>gdjsj</div>)
                                        // },

                                        // step: (state) => (<div>DJD</div>)
                                        // step: {
                                        //   applyIcon: (<div>Apply</div>),
                                        //   shareIcon: (<div>Share</div>),
                                        //   earnIcon: (<div>Earn</div>),
                                        // }
                                    }
                                }
                            }
                        >
                            <Story />
                        </ReferralProvider>
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
        // p: 5,
        // py: 2,
    },
} satisfies Meta<typeof Dashboard.DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Page: Story = {};


export const LayoutPage: Story = {
    render: () => {
        return <TradingRewardsLayoutWidget>
            <Dashboard.DashboardPage classNames={{
                root: "oui-flex oui-justify-center",
                home: "oui-py-6 oui-px-4 lg:oui-px-6 lg:oui-py-12 xl:oui-pl-4 lx:oui-pr-6",
                dashboard: "oui-py-6 oui-px-4 lg:oui-px-6 xl:oui-pl-3 lx:oui-pr-6",
            }} />
        </TradingRewardsLayoutWidget>
    },
}