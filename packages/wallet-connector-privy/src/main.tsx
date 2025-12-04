import React, { useMemo } from "react";
import { WalletConnectorContext } from "@veltodefi/hooks";
import type {
  WalletConnectorContextState,
  WalletState,
} from "@veltodefi/hooks";
import { ConnectDrawer } from "./components/connectDrawer";
import { useWallet } from "./hooks/useWallet";
import "./injectUsercenter";
import { useWalletConnectorPrivy } from "./provider";

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

  const connect = (options: any): Promise<WalletState[]> => {
    // fix wallet-connector package connect
    if (options && options.autoSelect) {
      return Promise.resolve([]);
    }
    setTargetWalletType(undefined);
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
