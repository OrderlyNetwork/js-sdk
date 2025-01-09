import React, { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import { WalletConnectorPrivyProvider } from "@orderly.network/wallet-connector-privy";
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
  // networkId: "testnet",
  // brokerId: "woofi_pro",
  // brokerName: "WOOFI",
  // env: "qa",
});

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <WalletConnectorProvider
      solanaInitial={{ wallets: wallets, onError: handleSolanaError }}
      // solanaInitial={{ wallets: wallets, onError: handleSolanaError, network: 'mainnet-beta', mainnetRpc: 'https://svc.blockdaemon.com/solana/mainnet/native?apiKey=zpka_dbb6d1ce22654830860472b76acf15db_62182ef5' }}

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
        // overrides={{
        //   tabs: {
        //     variant: "text",
        //   },
        // }}
      >
        {props.children}
      </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
};

export const OrderlyProviderPrivy: FC<{ children: ReactNode }> = (props) => {
  return (
    <WalletConnectorPrivyProvider>
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
        // overrides={{
        //   tabs: {
        //     variant: "text",
        //   },
        // }}
      >
        {props.children}
      </OrderlyAppProvider>
    </WalletConnectorPrivyProvider>
  )
}

export default OrderlyProvider;
