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
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import {
  Network,
  WalletConnectorPrivyProvider,
  wagmiConnectors,
} from "@orderly.network/wallet-connector-privy";
import { CustomProductNav } from "../src/components/customProductNav/indx";

const { VITE_NETWORK_ID, VITE_BROKER_ID, VITE_BROKER_NAME, VITE_ENV } =
  import.meta.env || {};
const mobileWalletNotFoundHanlder = (adapter: SolanaMobileWalletAdapter) => {
  console.log("-- mobile wallet adapter", adapter);

  return Promise.reject(new WalletNotReadyError("wallet not ready"));
};
const network = WalletAdapterNetwork.Devnet;
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
export const WalletConnectorPrivy: FC<{ children: ReactNode }> = (props) => {
  return (
    <WalletConnectorPrivyProvider
      termsOfUse="https://learn.woo.org/legal/terms-of-use"
      network={Network.testnet}
      headerProps={{
        mobile: <CustomProductNav />,
      }}
      // customChains={customChainsAbstarct}
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
      enableSwapDeposit={true}
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
