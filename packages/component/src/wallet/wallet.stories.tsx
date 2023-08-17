import type { Meta, StoryObj } from "@storybook/react";

import toast, { Toaster } from "react-hot-toast";
import { OrderlyProvider } from "../provider";

import {
  Web3OnboardProvider,
  init,
  useConnectWallet,
} from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import Button from "../button";
import { SvgImage } from "../icon";

const apiKey = "a2c206fa-686c-466c-9046-433ea1bf5fa6";

// const rpcUrl = `https://mainnet.infura.io/v3/${infuraKey}`
const FujiRpcUrl = "https://api.avax-test.network/ext/bc/C/rpc";
const INFURA_KEY = "3039f275d050427d8859a728ccd45e0c";

const fuji = {
  id: "43113",
  token: "AVAX",
  label: "Fuji",
  rpcUrl: FujiRpcUrl,
};

const chains = [fuji];
const wallets = [injectedModule()];
const web3Onboard = init({
  apiKey,
  wallets,
  chains,
  appMetadata: {
    name: "WooFi Dex",
    // icon: blocknativeIcon,
    description: "WooFi Dex",
    recommendedInjectedWallets: [
      { name: "Coinbase", url: "https://wallet.coinbase.com/" },
      { name: "MetaMask", url: "https://metamask.io" },
    ],
    agreement: {
      version: "1.0.0",
      termsUrl: "https://www.blocknative.com/terms-conditions",
      privacyUrl: "https://www.blocknative.com/privacy-policy",
    },
    gettingStartedGuide: "https://blocknative.com",
    explore: "https://blocknative.com",
  },
  theme: "dark",
});

const meta: Meta<typeof Toaster> = {
  component: Toaster,
  title: "Base/Wallet",
  decorators: [
    (Story) => {
      return (
        <Web3OnboardProvider web3Onboard={web3Onboard}>
          <Story />
        </Web3OnboardProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => {
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

    console.log(wallet, connecting, wallets);

    return (
      <div className={"flex gap-3"}>
        <Button
          onClick={() => {
            connect();
          }}
        >
          Connect Wallet
        </Button>
        <SvgImage
          svg={wallet?.icon ?? ""}
          backgroundColor={"transparent"}
          rounded
        />
      </div>
    );
  },
};
