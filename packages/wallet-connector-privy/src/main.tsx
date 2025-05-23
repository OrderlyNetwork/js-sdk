import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { WalletConnectorContext, WalletState } from "@orderly.network/hooks";
import { ConnectDrawer } from "./components/connectDrawer";
import { useWallet } from "./hooks/useWallet";
import "./injectUsercenter";
import { useWalletConnectorPrivy } from "./provider";

interface MainProps {
  children: React.ReactNode;
  headerProps?: {
    mobile: React.ReactNode;
  };
}

export function Main(props: MainProps) {
  const { wallet, connectedChain, setChain, namespace } = useWallet();
  const { openConnectDrawer, setOpenConnectDrawer, setTargetWalletType } =
    useWalletConnectorPrivy();

  const connect = (props: any): Promise<WalletState[]> => {
    console.log("xxxx main connect", props);
    // fix wallet-connector package connect
    if (props && props.autoSelect) {
      return Promise.resolve([]);
    }

    setTargetWalletType(undefined);
    return new Promise((resolve, reject) => {
      setOpenConnectDrawer(true);
      resolve([]);
    });
  };
  // console.log('--xxxmain wallet', wallet);

  const disconnect = useCallback(async (): Promise<WalletState[]> => {
    return Promise.resolve([]);
  }, [wallet]);

  const value = useMemo(
    () => ({
      connect,
      disconnect,
      connecting: false,
      wallet,
      setChain,
      connectedChain,
      namespace,
      chains: [],
      settingChain: false,
    }),
    [connect, setChain, connectedChain, wallet, namespace],
  );

  return (
    <WalletConnectorContext.Provider value={value}>
      <ConnectDrawer
        open={openConnectDrawer}
        onChangeOpen={setOpenConnectDrawer}
        headerProps={props.headerProps}
      />
      {props.children}
    </WalletConnectorContext.Provider>
  );
}
