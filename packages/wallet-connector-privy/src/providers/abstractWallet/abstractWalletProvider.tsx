import React, { useCallback, useEffect, useState } from "react";
import { useAbstractClient, useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { ConnectedChain, WalletState } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import {ethers} from 'ethers';
interface AbstractWalletContextValue {
  connect: () => void;
  isConnected: boolean;
  disconnect: () => void;
  wallet: WalletState | null;
  connectedChain: ConnectedChain | null;
}

const AbstractWalletContext = createContext<AbstractWalletContextValue | null>(
  null
);

export const AbstractWalletProvider = (props: PropsWithChildren) => {
  const {network} = useWalletConnectorPrivy();
  const {login, logout} = useLoginWithAbstract();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const {data: client} = useAbstractClient();

  const connect = () =>{
    return login();
  }

  const disconnect = () => {
    return logout();
  }

  const isConnected = useMemo(() => {
    return !!client;
  }, [client])

  const connectedChain = useMemo(() => {
    if (!client) {
      return null;
    }
    return {
      id: client.chain.id,
      namespace: ChainNamespace.evm,
    }
  }, [client])

  const value = useMemo(() => ({

    isConnected,
    connect,
    disconnect,
    wallet,
    connectedChain,
  }), [connect, disconnect, isConnected, wallet, connectedChain])


  useEffect(() => {
    if (!client) {
      setWallet(null);
      return;
    }
    const tempWallet = {
      label: "Abstract",
      icon: "",
      // @ts-ignore TODO
      provider: {
        signMessage: client.signMessage as any,
        sendTransaction: client.sendTransaction as any,
        
      },
      accounts: [{
        address: client.account.address,
      }],
      chains: [{
        id: client.chain.id,
        namespace: ChainNamespace.evm,
      }],
      chain: connectedChain,
    }
    console.log("-- abstract wallet tempWallet", tempWallet)
    setWallet(tempWallet as unknown as WalletState)
  }, [client, connectedChain])
  return (
    <AbstractWalletContext.Provider value={value}>
      {props.children}
    </AbstractWalletContext.Provider>
  );
};

export function useAbstractWallet() {
  const context = useContext(AbstractWalletContext);
  if (!context) {
    throw new Error("useAbstractWallet must be used within a AbstractWalletProvider");
  }
  return context;
}
