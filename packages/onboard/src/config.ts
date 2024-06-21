import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import type { InitOptions, OnboardAPI } from "@web3-onboard/core";
import { getChainsArray } from "./chains";
import { ConnectorInitOptions } from "./provider";

export const initConfig: (
  apiKey?: string,
  options?: InitOptions
) => OnboardAPI = (apiKey, options) => {
  return init({
    apiKey,
    connect: {
      autoConnectAllPreviousWallet: true,
    },
    //@ts-ignore
    wallets: [injectedModule()],
    chains: getChainsArray(),
    appMetadata: {
      name: "Orderly",
      // icon: blocknativeIcon,
      description: "Orderly",
      recommendedInjectedWallets: [
        { name: "Coinbase", url: "https://wallet.coinbase.com/" },
        { name: "MetaMask", url: "https://metamask.io" },
        { name: "Trezor", url: "https://trezor.io/" },
        { name: "Walletconnect", url: "https://walletconnect.com/" },
        { name: "Ledger", url: "https://www.ledger.com/" },
      ],
      agreement: {
        version: "1.0.0",
        termsUrl: "https://www.blocknative.com/terms-conditions",
        privacyUrl: "https://www.blocknative.com/privacy-policy",
      },
      gettingStartedGuide: "https://blocknative.com",
      explore: "https://blocknative.com",
    },
    accountCenter: {
      desktop: {
        enabled: false,
      },
      mobile: {
        enabled: false,
      },
    },
    theme: "dark",
    ...options,
  });
};
