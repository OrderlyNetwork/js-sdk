import React, { FC, ReactNode } from "react";
import {
  Network,
  WalletConnectorPrivyProvider,
  wagmiConnectors,
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
import { LocaleEnum, LocaleProvider } from "@orderly.network/i18n";
import { Resources } from "@orderly.network/i18n";
import { useOrderlyConfig } from "../src/hooks/useOrderlyConfig";
import en from "@orderly.network/i18n/locales/zh.json";
import zh from "@orderly.network/i18n/locales/zh.json";
import ja from "@orderly.network/i18n/locales/ja.json";
import es from "@orderly.network/i18n/locales/es.json";
import ko from "@orderly.network/i18n/locales/ko.json";
import vi from "@orderly.network/i18n/locales/vi.json";
import de from "@orderly.network/i18n/locales/de.json";
import fr from "@orderly.network/i18n/locales/fr.json";
import ru from "@orderly.network/i18n/locales/ru.json";
import id from "@orderly.network/i18n/locales/id.json";
import tr from "@orderly.network/i18n/locales/tr.json";
import it from "@orderly.network/i18n/locales/it.json";
import pt from "@orderly.network/i18n/locales/pt.json";
import uk from "@orderly.network/i18n/locales/uk.json";
import pl from "@orderly.network/i18n/locales/pl.json";
import nl from "@orderly.network/i18n/locales/nl.json";

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

// const customChains = customChainsEvm;
// const customChains = customChainsSolana;
// const customChains = customChainsSolanaAndEvm;

const { VITE_NETWORK_ID, VITE_BROKER_ID, VITE_BROKER_NAME, VITE_ENV } =
  import.meta.env || {};

const configStore = new CustomConfigStore({
  networkId: VITE_NETWORK_ID || "testnet",
  brokerId: VITE_BROKER_ID || "demo",
  brokerName: VITE_BROKER_NAME || "Orderly",
  env: VITE_ENV || "staging",
});

type ExtendLocaleMessages = typeof zh;

const resources: Resources<ExtendLocaleMessages> = {
  zh,
  ja,
  es,
  ko,
  vi,
  de,
  fr,
  ru,
  id,
  tr,
  it,
  pt,
  uk,
  pl,
  nl,
};

export const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
  const config = useOrderlyConfig();

  return (
    <LocaleProvider
      resources={resources}
      backend={{
        loadPath: (lang) => {
          return `/locales/extend/${lang}.json`;
          // if (lang === LocaleEnum.en) {
          //   // because en is built-in, we need to load the en extend only
          //   return `/locales/extend/${lang}.json`;
          // }
          // return [`/locales/${lang}.json`, `/locales/extend/${lang}.json`];
        },
      }}
    >
      <WalletConnectorPrivyProvider
        termsOfUse="https://learn.woo.org/legal/terms-of-use"
        network={Network.testnet}
        // customChains={customerChains}
        privyConfig={{
          appid: "cm50h5kjc011111gdn7i8cd2k",
          config: {
            appearance: {
              theme: "dark",
              accentColor: "#181C23",
              logo: "/orderly-logo.svg",
            },
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
          // customChains={customerChains}
          // defaultChain={{testnet: customChains.testnet[0], mainnet: customChains.mainnet[0]}}
        >
          {props.children}
        </OrderlyAppProvider>
      </WalletConnectorPrivyProvider>
    </LocaleProvider>
  );
};

export default OrderlyProvider;
