import type { Meta, StoryObj } from "@storybook/react";

import { AccountStatusBar } from ".";
import * as React from "react";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatus } from "./accountStatusBar";
import { OrderlyProvider } from "../../provider";
import { MemoryConfigStore, Web3WalletAdapter } from "@orderly.network/core";
import { init, useConnectWallet } from "@web3-onboard/react";
import { onboardConfig } from "../../../mock/onboardConfig";
import { useEffect } from "react";
import wallets from "@web3-onboard/injected-wallets/dist/wallets";
import { WooKeyStore } from "../../stories/mock/woo.keystore";

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
  decorators: [
    (Story) => (
      <OrderlyProvider
        configStore={new MemoryConfigStore()}
        keyStore={new WooKeyStore("testnet")}
        walletAdapter={new Web3WalletAdapter()}
      >
        <Story />
      </OrderlyProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AccountStatusBar>;

const web3Onboard = init(onboardConfig);

export const Default: Story = {
  render: (args) => {
    return (
      <div className="'h-screen">
        <div className="fiexed left-0 bottom-0">
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
    const { account, login, state, info } = useAccount();
    const [
      {
        wallet, // the wallet that has been connected or null if not yet connected
        connecting, // boolean indicating if connection is in progress
      },
      connect, // function to call to initiate user to connect wallet
      disconnect, // function to call with wallet<DisconnectOptions> to disconnect wallet
      updateBalances, // function to be called with an optional array of wallet addresses connected through Onboard to update balance or empty/no params to update all connected wallets
      setWalletModules, // function to be called with an array of wallet modules to conditionally allow connection of wallet types i.e. setWalletModules([ledger, trezor, injected])
      setPrimaryWallet, // function that can set the primary wallet and/or primary account within that wallet. The wallet that is set needs to be passed in for the first parameter and if you would like to set the primary account, the address of that account also needs to be passed in
    ] = useConnectWallet();

    useEffect(() => {
      console.log(wallet);
      if (
        wallet &&
        Array.isArray(wallet.accounts) &&
        wallet.accounts.length > 0
      ) {
        // updateBalances(wallet.accounts);
        // login(wallet.accounts[0].address);
        account.address = wallet.accounts[0].address;
      }
    }, [wallet]);

    // console.log("account state", state);

    return (
      <AccountStatusBar
        {...args}
        status={state.status}
        address={state.address}
        accountInfo={info}
        onConnect={() => {
          connect();
        }}
      />
    );
  },
};
