import type { Meta, StoryObj } from "@storybook/react";

import { AccountStatusBar } from ".";
import * as React from "react";
import { useAccount, useAccountInfo } from "@orderly.network/hooks";

const meta: Meta<typeof AccountStatusBar> = {
  //   tags: ["autodocs"],
  component: AccountStatusBar,
  title: "Block/AccountStatus/BottomBar",
  // parameters: {
  //   layout: "fullscreen",
  // },
  argTypes: {
    onConnect: { action: "onConnect" },
  },
  args: {
    status: "NotConnected",
  },
};

export default meta;

type Story = StoryObj<typeof AccountStatusBar>;

export const Default: Story = {
  render: (args) => {
    return (
      <div className="orderly-'h-screen">
        <div className="orderly-fiexed orderly-left-0 orderly-bottom-0">
          <AccountStatusBar {...args} />
        </div>
      </div>
    );
  },
  args: {
    loading: true,
  },
};

export const WithHook: Story = {
  render: (args) => {
    const { account, state } = useAccount();
    const { data: info } = useAccountInfo();

    //

    return (
      <AccountStatusBar
        {...args}
        status={state.status}
        address={state.address}
        accountInfo={info}
        onConnect={() => {}}
      />
    );
  },
};
