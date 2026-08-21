import { FC, ReactNode } from "react";
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
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { useThemeAttribute } from "@orderly.network/ui";
import {
  Network,
  WalletConnectorPrivyProvider,
  wagmiConnectors,
} from "@orderly.network/wallet-connector-privy";
import { themes } from "../../orderlyConfig/themes";
import { CustomProductNav } from "../customProductNav";
import {
  WALLET_CONNECT_APP_METADATA,
  WALLET_CONNECT_PROJECT_ID,
} from "./walletConnectorConfig";

const mobileWalletNotFoundHanlder = (adapter: SolanaMobileWalletAdapter) => {
  console.log("-- mobile wallet adapter", adapter);

  return Promise.reject(new WalletNotReadyError("wallet not ready"));
};

type WalletConnectorPrivyProps = {
  children: ReactNode;
  enablePrivyLogin?: boolean;
  networkId?: string;
};

function useThemeMode() {
  const themeId = useThemeAttribute();
  const theme = themes.find((theme) => theme.id === themeId);
  return theme?.mode === "light" ? "light" : "dark";
}

export const WalletConnectorPrivy: FC<WalletConnectorPrivyProps> = (props) => {
  const networkId =
    props.networkId || import.meta.env.VITE_NETWORK_ID || "testnet";
  const network = networkId === "testnet" ? Network.testnet : Network.mainnet;
  const solanaNetwork =
    networkId === "testnet"
      ? WalletAdapterNetwork.Devnet
      : WalletAdapterNetwork.Mainnet;
  const themeMode = useThemeMode();

  return (
    <WalletConnectorPrivyProvider
      key={themeMode}
      termsOfUse="https://learn.woo.org/legal/terms-of-use"
      network={network}
      headerProps={{
        mobile: <CustomProductNav />,
      }}
      // customChains={customChainsAbstarct}
      privyConfig={
        props.enablePrivyLogin
          ? {
              appid: "cm50h5kjc011111gdn7i8cd2k",
              config: {
                appearance: {
                  theme: themeMode,
                  accentColor: "rgb(var(--oui-color-base-8))",
                  logo:
                    themeMode === "light"
                      ? "/orderly-black.png"
                      : "/orderly-white.png",
                },
                loginMethods: ["email", "google", "twitter", "telegram"],
              },
            }
          : undefined
      }
      wagmiConfig={{
        connectors: [
          wagmiConnectors.injected(),
          wagmiConnectors.walletConnect({
            projectId: WALLET_CONNECT_PROJECT_ID,
            showQrModal: true,
            qrModalOptions: { themeMode },
            storageOptions: {},
            metadata: {
              name: WALLET_CONNECT_APP_METADATA.name,
              description: WALLET_CONNECT_APP_METADATA.description,
              url: WALLET_CONNECT_APP_METADATA.url,
              icons: [WALLET_CONNECT_APP_METADATA.icon],
            },
          }),
        ],
      }}
      solanaConfig={{
        mainnetRpc: "",
        devnetRpc: "https://api.devnet.solana.com",
        wallets: [
          new PhantomWalletAdapter(),
          new SolanaMobileWalletAdapter({
            addressSelector: createDefaultAddressSelector(),
            appIdentity: {
              uri: `${location.protocol}//${location.host}`,
            },
            authorizationResultCache: createDefaultAuthorizationResultCache(),
            chain: solanaNetwork,
            onWalletNotFound: mobileWalletNotFoundHanlder,
          }),
        ],
        onError: (error: WalletError, adapter?: Adapter) => {
          console.log(
            "error",
            error,
            adapter,
            error instanceof WalletNotReadyError,
            typeof error,
          );
          console.log("error message", error.message);
          console.log("error message", error.name);
          if (error.name === "WalletNotReadyError") {
            window.open(adapter?.url, "_blank");
            return;
          }
        },
      }}
      abstractConfig={{}}
    >
      {props.children}
    </WalletConnectorPrivyProvider>
  );
};
