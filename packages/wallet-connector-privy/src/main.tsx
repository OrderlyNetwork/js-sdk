import React, { useMemo } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import type {
  WalletConnectorContextState,
  WalletState,
} from "@orderly.network/hooks";
import {
  AbstractChains,
  SolanaChains,
  SuiChains,
} from "@orderly.network/types";
import { ConnectDrawer } from "./components/connectDrawer";
import { useWallet } from "./hooks/useWallet";
import "./injectUsercenter";
import { useWalletConnectorPrivy } from "./provider";
import { WalletType } from "./types";

interface MainProps {
  headerProps?: {
    mobile: React.ReactNode;
  };
}

export const Main: React.FC<React.PropsWithChildren<MainProps>> = (props) => {
  const { headerProps, children } = props;

  const { wallet, connectedChain, setChain, namespace, onDisconnect } =
    useWallet();

  const {
    openConnectDrawer,
    setOpenConnectDrawer,
    setTargetWalletType,
    suiInfo,
    suiChainIds,
  } = useWalletConnectorPrivy();

  const resolveWalletType = (chainId?: number | string) => {
    if (typeof chainId === "undefined") {
      return undefined;
    }

    const nextChainId =
      typeof chainId === "number" ? chainId : parseInt(chainId as string);
    if (Number.isNaN(nextChainId)) {
      return undefined;
    }

    if (
      SuiChains.has(nextChainId) ||
      suiInfo?.chainId === nextChainId ||
      suiChainIds.has(nextChainId)
    ) {
      return WalletType.SUI;
    }
    if (SolanaChains.has(nextChainId)) {
      return WalletType.SOL;
    }
    if (AbstractChains.has(nextChainId)) {
      return WalletType.ABSTRACT;
    }
    return WalletType.EVM;
  };

  const connect = (options: any): Promise<WalletState[]> => {
    // fix wallet-connector package connect
    if (options && options.autoSelect) {
      return Promise.resolve([]);
    }
    setTargetWalletType(resolveWalletType(options?.chainId));
    return new Promise((resolve) => {
      setOpenConnectDrawer(true);
      resolve([]);
    });
  };

  const memoizedValue = useMemo<WalletConnectorContextState>(
    () => ({
      connect,
      disconnect: onDisconnect,
      connecting: false,
      wallet,
      setChain,
      connectedChain,
      namespace,
      chains: [],
      settingChain: false,
    }),
    [connect, setChain, onDisconnect, connectedChain, wallet, namespace],
  );

  return (
    <WalletConnectorContext.Provider value={memoizedValue}>
      <ConnectDrawer
        open={openConnectDrawer}
        onChangeOpen={setOpenConnectDrawer}
        headerProps={headerProps}
      />
      {children}
    </WalletConnectorContext.Provider>
  );
};
