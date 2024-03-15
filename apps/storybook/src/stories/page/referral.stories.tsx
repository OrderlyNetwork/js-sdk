import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Dashboard, Affiliate, Trader, ReferralProvider, Referral } from "@orderly.network/referral";
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
        becomeAnAffiliateUrl="https://orderly.network"
        learnAffiliateUrl="https://orderly.network"
        referralLinkUrl="https://dex.woo.org/en/trade"
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