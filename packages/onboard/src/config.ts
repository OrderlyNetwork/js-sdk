import injectedModule from "@web3-onboard/injected-wallets";
import { init } from "@web3-onboard/react";
import type { InitOptions, OnboardAPI } from "@web3-onboard/core";
import { getChainsArray } from "./chains";

const API_KEY = "a2c206fa-686c-466c-9046-433ea1bf5fa6";

export const initConfig: (
  apiKey?: string,
  options?: InitOptions
) => Promise<OnboardAPI> = (apiKey = API_KEY, options) => {
  return Promise.resolve().then(() =>
    init({
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
    })
  );
};
