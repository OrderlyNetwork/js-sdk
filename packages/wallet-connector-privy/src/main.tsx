import React, { PropsWithChildren, useState } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { ConnectPanel } from "./connectPanel";
import { useWallet } from "./useWallet";
import { ChainNamespace } from "@orderly.network/types";
import { modal, SimpleDialog } from "@orderly.network/ui";
import { ConnectDrawer } from "./connectDrawer";

export function Main(props: PropsWithChildren) {
  const { wallet, connectedChain, setChain } = useWallet();

  const [openConnectDrawer, setOpenConnectDrawer] = useState(false);

  const connect = () =>{
    return new Promise((resolve, reject) => {
      setOpenConnectDrawer(true);

    })
  }
  console.log('-- wallet', wallet);
  // const connectedChain =wallet ? wallet.chain : null;
  // console.log('-- connected chain', connectedChain);

  return (
    <WalletConnectorContext.Provider
      value={{
        connect: connect,
        disconnect: () => Promise.resolve(),
        connecting: false,
        wallet: wallet,
        setChain,
        connectedChain:connectedChain,
        namespace: ChainNamespace.evm,
      }}
    >
      <ConnectDrawer open={openConnectDrawer} onChangeOpen={setOpenConnectDrawer} />
      {props.children}
    </WalletConnectorContext.Provider>
  );
}   