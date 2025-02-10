import React, { PropsWithChildren, useMemo, useState } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { ConnectPanel } from "./connectPanel";
import { useWallet } from "./useWallet";
import { ChainNamespace } from "@orderly.network/types";
import { modal, SimpleDialog } from "@orderly.network/ui";
import { ConnectDrawer } from "./components/connectDrawer";

export function Main(props: PropsWithChildren) {
  const { wallet, connectedChain, setChain, namespace } = useWallet();

  const [openConnectDrawer, setOpenConnectDrawer] = useState(false);

  const connect = () =>{
    return new Promise((resolve, reject) => {
      setOpenConnectDrawer(true);

    })
  }
  console.log('-- wallet', wallet);
  const value = useMemo(() => (
    {
      connect: connect,
      disconnect: () => Promise.resolve(),
      connecting: false,
      wallet: wallet,
      setChain,
      connectedChain:connectedChain,
      namespace: namespace,
    }
  ), [connect, setChain, connectedChain, wallet, namespace]);
  // const connectedChain =wallet ? wallet.chain : null;
  // console.log('-- connected chain', connectedChain);
  console.log('-- wallet provide value', value);

  return (
    <WalletConnectorContext.Provider
      value={value}
    >
      <ConnectDrawer open={openConnectDrawer} onChangeOpen={setOpenConnectDrawer} />
      {props.children}
    </WalletConnectorContext.Provider>
  );
}   