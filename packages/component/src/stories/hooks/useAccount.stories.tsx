import React, { FC } from "react";

import { Meta, StoryObj } from "@storybook/react";
import { useAccount } from "@orderly.network/hooks";
import { OrderlyProvider } from "../../provider";
import { MemoryConfigStore } from "@orderly.network/core";
import { API } from "@orderly.network/types";

const AccountDemo: FC<{
  info: API.AccountInfo;
}> = (props) => {
  return (
    <div className="text-black">
      <div className="text-lg">Account Info</div>
      ------------------------
      <div>
        <pre>{JSON.stringify(props.info, null, 2)}</pre>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/useAccount",
  component: AccountDemo,
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider configStore={new MemoryConfigStore()}>
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

type Story = StoryObj<typeof AccountDemo>;

export default meta;

export const Default: Story = {
  render: () => {
    const account = useAccount();
    return <AccountDemo info={account.info} />;
  },
};
