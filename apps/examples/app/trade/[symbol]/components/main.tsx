"use client";

import {
  OnboardConnectorProvider,
  OrderlyProvider,
} from "@orderly.network/components";
import {
  MemoryConfigStore,
  EtherAdapter,
  BaseContractManager,
  LocalStorageStore,
} from "@orderly.network/core";

import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";

const apiKey = "a2c206fa-686c-466c-9046-433ea1bf5fa6";

const Arbitrum = {
  id: 421613,
  // chainId: '421613',
  label: "Arbitrum Goerli",
  token: "AGOR",
  rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
};

const chains = [Arbitrum];
const wallets = [injectedModule()];
const web3Onboard = init({
  apiKey,
  connect: {
    autoConnectAllPreviousWallet: true,
  },
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
  // accountCenter: {
  //   desktop: {
  //     enabled: false,
  //   },
  //   mobile: {
  //     enabled: false,
  //   },
  // },
  theme: "dark",
});

export const TradingMainPage = () => {
  const configStore = new MemoryConfigStore();
  const contractManager = new BaseContractManager(configStore);
  return (
    <OnboardConnectorProvider>
      <OrderlyProvider
        configStore={configStore}
        walletAdapter={EtherAdapter}
        contractManager={contractManager}
        keyStore={new LocalStorageStore("testnet")}
        logoUrl="/woo_fi_logo.svg"
      >
        <div>Trading Page</div>
      </OrderlyProvider>
    </OnboardConnectorProvider>
  );
};
