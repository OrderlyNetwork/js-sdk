import React, { useMemo } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import type {
  WalletConnectorContextState,
  WalletState,
} from "@orderly.network/hooks";
import { ConnectDrawer } from "./components/connectDrawer";
import { useWallet } from "./hooks/useWallet";
import "./injectUsercenter";
import { useWalletConnectorPrivy } from "./provider";
import { getWalletTypeByChainId } from "./util";

interface MainProps {
  headerProps?: {
    mobile: React.ReactNode;
  };
}

export const Main: React.FC<React.PropsWithChildren<MainProps>> = (props) => {
  const { headerProps, children } = props;

  const { wallet, connectedChain, setChain, namespace, onDisconnect } =
    useWallet();

  const { openConnectDrawer, setOpenConnectDrawer, setTargetWalletType } =
    useWalletConnectorPrivy();

  const resolveWalletType = (chainId?: number | string) => {
    if (typeof chainId === "undefined") {
      return undefined;
    }

    const nextChainId =
      typeof chainId === "number" ? chainId : parseInt(chainId as string);
    if (Number.isNaN(nextChainId)) {
      return undefined;
    }

    return getWalletTypeByChainId(nextChainId);
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
