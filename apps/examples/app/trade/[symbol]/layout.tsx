"use client";

import { useEffect, useState } from "react";

import { init } from "@web3-onboard/react";
import injectedModule from "@web3-onboard/injected-wallets";
import walletConnectModule, {
  type WalletConnectOptions,
} from "@web3-onboard/walletconnect";

import { TradingMainPage } from "./components/main";
import "@orderly.network/components/dist/styles.css";

import "./theme.css";

const apiKey = "a2c206fa-686c-466c-9046-433ea1bf5fa6";
const wcV2InitOptions: WalletConnectOptions = {
  version: 2,
  projectId: "b45fbf4d8739c599cb4e50486bc5eca9",
  requiredChains: [421613],
  optionalChains: [421613],
  // dappUrl: window.location.host,
};
const walletConnect = walletConnectModule(wcV2InitOptions);

const Arbitrum = {
  id: 421613,
  // chainId: '421613',
  label: "Arbitrum Goerli",
  token: "AGOR",
  rpcUrl: "https://endpoints.omniatech.io/v1/arbitrum/goerli/public",
};

const chains = [Arbitrum];
const wallets = [injectedModule(), walletConnect];

export default function TradeLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const [onboard, setOnboard] = useState<any>(null);

  useEffect(() => {
    if (onboard) return;

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
      accountCenter: {
        desktop: {
          enabled: false,
        },
        mobile: {
          enabled: false,
        },
      },
      theme: "dark",
    });

    setOnboard(web3Onboard);
  }, []);

  if (!onboard) return null;

  return <>{children}</>;
}
