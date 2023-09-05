import type { Meta, StoryObj } from "@storybook/react";
import {
  MemoryConfigStore,
  LocalStorageStore,
  EtherAdapter,
} from "@orderly.network/core";
import toast, { Toaster } from "react-hot-toast";
import { OrderlyProvider } from "../provider";
import { OrderlyContext, useAccount } from "@orderly.network/hooks";
import { modal } from "../modal";
import { WalletConnectSheet } from "../block/walletConnect/walletConnect";

import Button from "../button";
import { SvgImage } from "../icon";
import React, { useContext } from "react";
import { WooKeyStore } from "../stories/mock/woo.keystore";
import { AccountStatusEnum } from "@orderly.network/types";
import { OnboardConnectorProvider } from "../provider/walletConnectorProvider";

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  title: "Block/Login",
  decorators: [
    (Story) => {
      // console.log("***********", wallet);

      return (
        <OnboardConnectorProvider>
          <OrderlyProvider
            configStore={new MemoryConfigStore()}
            walletAdapter={EtherAdapter}
            // keyStore={new WooKeyStore("testnet")}
            keyStore={new LocalStorageStore("testnet")}
            logoUrl="/woo_fi_logo.svg"
          >
            <Story />
          </OrderlyProvider>
        </OnboardConnectorProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => {
    const { onWalletConnect } = useContext(OrderlyContext);

    return (
      <div className={"flex gap-3"}>
        <Button
          onClick={() => {
            onWalletConnect().then((result) => {
              console.log("wallet connect.....", result);
              if (
                result &&
                result.status &&
                result.status < AccountStatusEnum.EnableTrading
              ) {
                modal.show(WalletConnectSheet, {
                  status: result.status,
                });
              }
            });
          }}
        >
          Connect Wallet
        </Button>
      </div>
    );
  },
};
