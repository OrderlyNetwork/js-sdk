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
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import config from "../src/config";
import { Chains } from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";

const network = WalletAdapterNetwork.Devnet;

const mobileWalletNotFoundHanlder = (adapter: SolanaMobileWalletAdapter) => {
  console.log("-- mobile wallet adapter", adapter);

  return Promise.reject(new WalletNotReadyError("wallet not ready"));
};

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  new LedgerWalletAdapter(),
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

const { VITE_NETWORK_ID, VITE_BROKER_ID, VITE_BROKER_NAME, VITE_ENV } =
  import.meta.env || {};

const configStore = new CustomConfigStore({
  networkId: VITE_NETWORK_ID || "testnet",
  brokerId: VITE_BROKER_ID || "demo",
  brokerName: VITE_BROKER_NAME || "Orderly",
  env: VITE_ENV || "staging",
});

const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  console.log("-- provider", configStore, VITE_ENV);

  return (
    <WalletConnectorProvider
      solanaInitial={{
        wallets: wallets,
        // network: "mainnet-beta" as WalletAdapterNetwork,
        network: WalletAdapterNetwork.Devnet,
        mainnetRpc:
          "https://svc.blockdaemon.com/solana/mainnet/native?apiKey=zpka_acfc3073385c4744b097aa86dc5b2f3c_1335ff06",
      }}
      // solanaInitial={{ wallets: wallets, onError: handleSolanaError, network: 'mainnet-beta', mainnetRpc: 'https://svc.blockdaemon.com/solana/mainnet/native?apiKey=zpka_dbb6d1ce22654830860472b76acf15db_62182ef5' }}
    >
      <OrderlyAppProvider
        // brokerId="orderly"
        // brokerName="Orderly"
        // networkId="testnet"
        configStore={configStore}
        appIcons={config.orderlyAppProvider.appIcons}
        restrictedInfo={config.orderlyAppProvider.restrictedInfo}
        // overrides={{
        //   tabs: {
        //     variant: "text",
        //   },
        //   chainSelector: {
        //     showTestnet: false,
        //   },
        // }}
        // defaultChain={{
        //   mainnet: { id: 900900900 },
        //   testnet: { id: 901901901 },
        // }}
      >
        {props.children}
      </OrderlyAppProvider>
    </WalletConnectorProvider>
  );
};

export default OrderlyProvider;
