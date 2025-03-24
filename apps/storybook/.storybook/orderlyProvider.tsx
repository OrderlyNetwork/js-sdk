import React, { FC, ReactNode } from "react";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";
import {
  Network,
  WalletConnectorPrivyProvider,
  wagmiConnectors,
  wagmi,
} from "@orderly.network/wallet-connector-privy";
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
import { LocaleMessages, LocaleProvider, en } from "@orderly.network/i18n";
import { Resources } from "@orderly.network/i18n";
import zh from "./locale/zh.json";

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

const resources: Resources = {
  zh,
};

export const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  return (
    <LocaleProvider
      resources={resources}
      // supportedLanguages={["zh", "en", "ja", "es", "fr"]}
    >
      <WalletConnectorPrivyProvider
        termsOfUse="https://learn.woo.org/legal/terms-of-use"
        network={Network.testnet}
        // customChains={{mainnet: [], testnet: []}}
        privyConfig={{
          appid: "cm50h5kjc011111gdn7i8cd2k",
          appearance: {
            theme: "dark",
            accentColor: "#181C23",
            logo: "/orderly-logo.svg",
            loginMethods: ["email", "google", "twitter"],
          },
        }}
        wagmiConfig={{
          connectors: [
            wagmiConnectors.injected(),
            wagmiConnectors.walletConnect({
              projectId: "93dba83e8d9915dc6a65ffd3ecfd19fd",
              showQrModal: true,
              storageOptions: {},
              metadata: {
                name: "Orderly Network",
                description: "Orderly Network",
                url: "https://orderly.network",
                icons: ["https://oss.orderly.network/static/sdk/chains.png"],
              },
            }),
          ],
        }}
        solanaConfig={{
          mainnetRpc: "",
          devnetRpc: "https://api.devnet.solana.com",
          wallets: wallets,
          onError: (error: WalletError, adapter?: Adapter) => {
            console.log("-- error", error, adapter);
          },
        }}
      >
        <OrderlyAppProvider
          configStore={configStore}
          appIcons={config.orderlyAppProvider.appIcons}
          restrictedInfo={config.orderlyAppProvider.restrictedInfo}
        >
          {props.children}
        </OrderlyAppProvider>
      </WalletConnectorPrivyProvider>
    </LocaleProvider>
  );
};

export default OrderlyProvider;
