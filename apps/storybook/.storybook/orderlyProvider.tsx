import React, { FC, ReactNode } from "react";
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  SolanaMobileWalletAdapter,
} from "@solana-mobile/wallet-adapter-mobile";
import {
  Adapter,
  WalletAdapterNetwork,
  type WalletError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { LocaleEnum, LocaleProvider } from "@orderly.network/i18n";
import { Resources } from "@orderly.network/i18n";
import de from "@orderly.network/i18n/locales/de.json";
import en from "@orderly.network/i18n/locales/en.json";
import es from "@orderly.network/i18n/locales/es.json";
import fr from "@orderly.network/i18n/locales/fr.json";
import id from "@orderly.network/i18n/locales/id.json";
import it from "@orderly.network/i18n/locales/it.json";
import ja from "@orderly.network/i18n/locales/ja.json";
import ko from "@orderly.network/i18n/locales/ko.json";
import nl from "@orderly.network/i18n/locales/nl.json";
import pl from "@orderly.network/i18n/locales/pl.json";
import pt from "@orderly.network/i18n/locales/pt.json";
import ru from "@orderly.network/i18n/locales/ru.json";
import tr from "@orderly.network/i18n/locales/tr.json";
import uk from "@orderly.network/i18n/locales/uk.json";
import vi from "@orderly.network/i18n/locales/vi.json";
import zh from "@orderly.network/i18n/locales/zh.json";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { useNav } from "../src/hooks/useNav";
import { useOrderlyConfig } from "../src/hooks/useOrderlyConfig";
import { CustomConfigStore } from "./customConfigStore";
// import { WalletConnector } from "./walletConnector";
import { WalletConnectorPrivy } from "./walletConnectorPrivy";

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

const OrderApp: React.FC<React.PropsWithChildren> = (props) => {
  const config = useOrderlyConfig();
  const { onRouteChange } = useNav();
  return (
    <OrderlyAppProvider
      configStore={configStore}
      appIcons={config.orderlyAppProvider.appIcons}
      restrictedInfo={config.orderlyAppProvider.restrictedInfo}
      enableSwapDeposit={true}
      onRouteChange={(option) => {
        onRouteChange(option as any);
      }}
      // dataAdapter={{
      //   symbolList(original) {
      //     return original.filter(
      //       (item) =>
      //         item.symbol === "PERP_SOL_USDC" ||
      //         item.symbol === "PERP_WOO_USDC" ||
      //         item.symbol === "PERP_ETH_USDC",
      //     );
      //   },
      // }}
      overrides={{
        announcement: {
          dataAdapter: (data) => [
            {
              announcement_id: "leaderboard",
              message: "DAWN OF DOMINANCE: $25,000 Trading Campaign is live!",
              url: "https://app.orderly.network/tradingRewards",
              type: "Campaign",
            },
            ...data,
          ],
        },
      }}
      // customChains={customChainsAbstarct}
      // defaultChain={{testnet: customChains.testnet[0], mainnet: customChains.mainnet[0]}}
    >
      {props.children}
    </OrderlyAppProvider>
  );
};
export const DappProvider: FC<{ children: ReactNode }> = (props) => {
  // use privy wallet connector
  return (
    <WalletConnectorPrivy>
      <OrderApp>{props.children}</OrderApp>
    </WalletConnectorPrivy>
  );
  // use wallet-connector(web3 onboard)
  // return (
  //   <WalletConnector>
  //     <OrderApp>{props.children}</OrderApp>
  //   </WalletConnector>
  // );
};
export const OrderlyProvider: FC<{ children: ReactNode }> = (props) => {
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
      <DappProvider>{props.children}</DappProvider>
    </LocaleProvider>
  );
};

export default OrderlyProvider;
