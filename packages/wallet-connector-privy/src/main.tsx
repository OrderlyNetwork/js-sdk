import React, { PropsWithChildren } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { ConnectPanel } from "./connectPanel";
import { useWallet } from "./useWallet";
import { ChainNamespace } from "@orderly.network/types";

export function Main(props: PropsWithChildren) {
  const { wallet, connectedChain, setChain } = useWallet();
  console.log('-- wallet', wallet);
  // const connectedChain =wallet ? wallet.chain : null;
  // console.log('-- connected chain', connectedChain);

  return (
    <WalletConnectorContext.Provider
      value={{
        connect: () => Promise.resolve(),
        disconnect: () => Promise.resolve(),
        connecting: false,
        wallet: wallet,
        setChain,
        connectedChain:connectedChain,
        namespace: ChainNamespace.evm,
      }}
    >
      <ConnectPanel />
      {props.children}
    </WalletConnectorContext.Provider>
  );
}   