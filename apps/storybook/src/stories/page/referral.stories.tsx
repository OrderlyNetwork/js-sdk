import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dashboard, Affiliate, Trader, ReferralProvider, Referral, InitialBarStyle } from "@orderly.network/referral";
import { OrderlyAppProvider } from "@orderly.network/react";
import { useAccount } from "@orderly.network/hooks";
import { AccountState } from "@orderly.network/core";
import { AccountStatusEnum } from "../../../../../packages/types/dist";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export

export default {
  title: "Page/Referral",
  component: ReferralProvider,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  //   tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
  decorators: [
    (Story) => (
      <ReferralProvider
        // becomeAnAffiliateUrl="https://orderly.network"
        // learnAffiliateUrl="https://orderly.network"
        // referralLinkUrl="https://dex.woo.org/en/trade"
        showReferralPage={() => {
          console.log("show referral page");

        }}
        enterAffiliatePage={() => {
          console.log("show affiliate page");
        }}

        enterTraderPage={() => {
          console.log("show trader page");

        }}
        chartConfig={
          {
            trader: { 
              bar: { ...InitialBarStyle, fill: "#00B49E", columnPadding: 20 } 
            },
            affiliate: { 
              bar: { ...InitialBarStyle, fill: "#608CFF", columnPadding: 20 } 
            },
          }
        }
        // intl={
          // {
            // messages,
          // }
        // }
        splashPage={() => (<div style={{backgroundColor: "#FF0000"}}>df</div>)}
        overwrite={
          {
            ref: {
              // gradientTitle: "Mark",
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
    ),
  ],
};

type Story = StoryObj<typeof Dashboard>;
// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Default: Story = {
  render: (args, { globals }) => {

    return <Referral />;
    // return (
    //   <ReferralProvider 
    //     becomeAnAffiliateUrl="https://orderly.network"
    //     learnAffiliateUrl="https://orderly.network"
    //   >
    //     <Referral />
    //   </ReferralProvider>
    // );
  }
};

export const LoginState: Story = {
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: "fullscreen",
  },
  render: (args: any) => {
    const account = useAccount();

    console.log("account", account);


    // @ts-ignore
    if (account.state.status !== AccountStatusEnum.EnableTrading) {
      return (
        <button onClick={() => {

        }}>Login</button>
      );
    }

    return (<div>{account.account.accountId}</div>);
  }
}

export const DashboardPage: Story = {
  render: (args: any) => {
    return <Dashboard />;
  }
}


export const AffiliatePage: Story = {
  render: (args) => {
    return <Affiliate />
  }
};

export const TraderPage: Story = {
  render: (args) => {
    return <Trader />
  }
};


export const messages = {
  "refferal.title": "Earn more as a {name} affiliate ==",
  "refferal.subtitle": "Grow your brand | Get 40% commission | Unlock exclusive perks ==",
  "refferal.linkUrl": "Learn how it works ==", 
  "referral.not.ref.card.title": "As an affiliate ==",
  "referral.not.ref.card.subtitle": "Onboard traders to earn passive income ==",
  "referral.not.ref.card.btn": "Become an affiliate ==",
  "referral.not.ref.card.hint.title": "40%~80% ==",
  "referral.not.ref.card.hint.subtitle": "Commission ==",
  "referral.ref.card.title": "Affiliate ==",
  "referral.ref.card.comission": "Commission (USDC) ==",
  "referral.ref.card.enter": "Enter ==",
  "referral.not.trader.card.title": "As a trader ==",
  "referral.not.trader.card.subtitle": "Get fee rebates on every trade ==",
  "referral.not.trader.card.btn": "Enter code ==",
  "referral.not.trader.card.hint.title": "0%~20% ==",
  "referral.not.trader.card.hint.subtitle": "Rebate ==",
  "referral.trader.card.title": "Trader ==",
  "referral.trader.card.rebate": "Rebate (USDC) ==",
  "referral.trader.card.enter": "Enter ==",
  "referral.step.title": "Becoming an affiliate is easy ==",
  "referral.step.apply.title": "Apply ==",
  "referral.step.apply.subtitle": "Fill out the application form ==",
  "referral.step.share.title": "Share ==",
  "referral.step.share.subtitle": "Unlock your affiliate link and share it with your community ==",
  "referral.step.earn.title": "Earn ==",
  "referral.step.earn.subtitle": "Get paid and receive special treatment 24/7, 365 ==",
}