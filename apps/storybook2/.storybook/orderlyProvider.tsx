import React, { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { CustomConfigStore } from "./customConfigStore";
import {
  Adapter,
  WalletAdapterNetwork,
  type WalletError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  SolanaMobileWalletAdapter,
} from "@solana-mobile/wallet-adapter-mobile";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { customChains } from "./customChains";

const network = WalletAdapterNetwork.Devnet;

const mobileWalletNotFoundHanlder = (adapter: SolanaMobileWalletAdapter) => {
  console.log("-- mobile wallet adapter", adapter);

  return Promise.reject(new WalletNotReadyError("wallet not ready"));
};

const handleSolanaError = (error: WalletError, adapter?: Adapter) => {
  console.log("-- solanan error", error);
  console.log("-- solana adapter", adapter);
};

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new SolanaMobileWalletAdapter({
    addressSelector: createDefaultAddressSelector(),
    appIdentity: {
      uri: `${location.protocol}//${location.host}`,
    },
    authorizationResultCache: createDefaultAuthorizationResultCache(),
    chain: network,
    onWalletNotFound: mobileWalletNotFoundHanlder,
  }),
];
const configStore = new CustomConfigStore({
  networkId: "testnet",
  brokerId: "demo",
  brokerName: "Orderly",
  env: "staging",
});

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <WalletConnectorProvider
      solanaInitial={{ wallets: wallets, onError: handleSolanaError }}
    >
      <OrderlyAppProvider
        // brokerId="orderly"
        // brokerName="Orderly"
        // networkId="testnet"
        configStore={configStore}
        appIcons={{
          main: {
            img: "/orderly-logo.svg",
          },
          secondary: {
            img: "/orderly-logo-secondary.svg",
          },
        }}
        // customChains={customChains as any}
      >
        {props.children}
      </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
};

export default OrderlyProvider;
