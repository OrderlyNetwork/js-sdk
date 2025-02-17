import React, { PropsWithChildren, useEffect, useMemo } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { useWallet } from "./useWallet";
import { ConnectDrawer } from "./components/connectDrawer";
import { useWalletConnectorPrivy } from "./provider";
import { injectUsercenter } from "./injectUsercenter";

export function Main(props: PropsWithChildren) {
  const { wallet, connectedChain, setChain, namespace } = useWallet();
  const { openConnectDrawer, setOpenConnectDrawer, setTargetNamespace } = useWalletConnectorPrivy();

  const connect = (props: any) => {
    console.log('xxxx main connect', props);
    // fix wallet-connector package connect
    if (props && props.autoSelect) {
      return Promise.resolve([]);
    }
    
    
    setTargetNamespace(undefined);
    return new Promise((resolve, reject) => {
      setOpenConnectDrawer(true);
      resolve([])
    });
  };
  console.log('--xxxmain wallet', wallet);

  const value = useMemo(
    () => ({
      connect,
      disconnect: () => Promise.resolve(),
      connecting: false,
      wallet,
      setChain,
      connectedChain,
      namespace,
      chains: [],
      settingChain: false,
    }),
    [connect, setChain, connectedChain, wallet, namespace]
  );

  useEffect(() => {
    injectUsercenter();
  }, []);

  return (
    <WalletConnectorContext.Provider value={value}>
      <ConnectDrawer open={openConnectDrawer} onChangeOpen={setOpenConnectDrawer} />
      {props.children}
    </WalletConnectorContext.Provider>
  );
}
