import React, { createContext, useContext, useMemo } from "react";
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  SolanaMobileWalletAdapter,
} from "@solana-mobile/wallet-adapter-mobile";
import {
  Adapter,
  WalletAdapterNetwork,
  WalletError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useScreen } from "@orderly.network/ui";
import { getGlobalObject } from "@orderly.network/utils";
import { SolanaInitialProps } from "./types";
import "@solana/wallet-adapter-react-ui/styles.css";

const SolanaContext = createContext<{
  network: WalletAdapterNetwork;
  endpoint: string;
}>({
  network: WalletAdapterNetwork.Devnet,
  endpoint: "",
});

export const useSolanaContext = () => {
  const context = useContext(SolanaContext);

  if (context === undefined) {
    throw new Error("useSolanaContext must be used within a SolanaProvider");
  }

  return context;
};

export function SolanaProvider({ children, ...props }: SolanaInitialProps) {
  const { isMobile } = useScreen();
  const network = useMemo(
    () => props.network ?? WalletAdapterNetwork.Devnet,
    [props.network],
  );

  const endpoint = useMemo(() => {
    if (network === WalletAdapterNetwork.Mainnet) {
      return props.mainnetRpc ?? "";
    }
    if (network === WalletAdapterNetwork.Devnet) {
      return props.devnetRpc ?? "";
    }
    return "";
  }, [network, props.mainnetRpc, props.devnetRpc]);

  const mobileWalletNotFoundHanlder = (adapter: SolanaMobileWalletAdapter) => {
    console.log("-- mobile wallet adapter", adapter);
    return Promise.reject(new WalletNotReadyError("wallet not ready"));
  };

  const handleSolanaError = (error: WalletError, adapter?: Adapter) => {
    console.log("-- solanan error", error);
    console.log("-- solana adapter", adapter);

    if (!isMobile && error instanceof WalletNotReadyError) {
      window.open(adapter?.url, "_blank");
    }
  };

  const wallets = useMemo(() => {
    let uri = "";
    if (typeof window !== "undefined") {
      const location = (getGlobalObject() as any).location;
      uri = `${location.protocol}//${location.host}`;
    }

    return (
      props.wallets ?? [
        new PhantomWalletAdapter(),
        new SolanaMobileWalletAdapter({
          addressSelector: createDefaultAddressSelector(),
          appIdentity: {
            uri,
          },
          authorizationResultCache: createDefaultAuthorizationResultCache(),
          chain: network,
          onWalletNotFound: mobileWalletNotFoundHanlder,
        }),
      ]
    );
  }, [props.wallets, network]);

  const contextValue = useMemo(
    () => ({
      network,
      endpoint,
    }),
    [network, endpoint],
  );

  return (
    <SolanaContext.Provider value={contextValue}>
      <WalletProvider
        wallets={wallets}
        onError={props.onError ?? handleSolanaError}
        autoConnect={true}
      >
        <WalletModalProvider className="oui-pointer-events-auto">
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </SolanaContext.Provider>
  );
}
