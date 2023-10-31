import React, { FC } from "react";

import { Meta, StoryObj } from "@storybook/react";
import { OrderlyProvider } from "../../provider";
import { MemoryConfigStore } from "@orderly.network/core";
import { useAppState } from "@orderly.network/hooks";
import { SystemStateEnum } from "@orderly.network/types";
import { Page } from "../../layout";
import { WooKeyStore } from "../../stories/mock/woo.keystore";

const AppStateDemo: FC<{
  systemState: any;
  exchangeState: any;
}> = (props) => {
  return (
    <div className="text-black">
      <div>
        System State: <span>{props.systemState}</span>
      </div>
      <div>
        Exchange State: <span>{props.exchangeState}</span>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: "hooks/useAppState",
  component: AppStateDemo,
  decorators: [
    (Story) => {
      return (
        <OrderlyProvider
          configStore={new MemoryConfigStore()}
          keyStore={new WooKeyStore("testnet")}
          walletAdapter={undefined}
        >
          <Story />
        </OrderlyProvider>
      );
    },
  ],
};

type Story = StoryObj<typeof AppStateDemo>;

export default meta;

export const Default: Story = {
  render: () => {
    const state = useAppState();

    return (
      <AppStateDemo
        exchangeState={state.exchangeState}
        systemState={state.systemState}
      />
    );
  },
};

export const LoadingPage: Story = {
  render: () => {
    const state = useAppState();
    return (
      <Page systemState={SystemStateEnum.Loading}>
        <AppStateDemo
          exchangeState={state.exchangeState}
          systemState={state.systemState}
        />
      </Page>
    );
  },
};
