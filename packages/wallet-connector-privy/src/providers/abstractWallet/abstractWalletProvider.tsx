import React from "react";
import { useAbstractClient, useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";

interface AbstractWalletContextValue {
  connect: () => void;
  isConnected: boolean;
  disconnect: () => void;
}

const AbstractWalletContext = createContext<AbstractWalletContextValue | null>(
  null
);

export const AbstractWalletProvider = (props: PropsWithChildren) => {
  const {login, logout} = useLoginWithAbstract();
  const {data: client} = useAbstractClient();
  const isConnected = useMemo(() => {
    if (!client) {
      return false;
    }
    
    return true;

  }, [client])
  const connect = () =>{
    return login();
  }

  const disconnect = () => {
    return logout();
  }

  const value = useMemo(() => ({

    isConnected,
    connect,
    disconnect,
    

  }), [connect, disconnect, isConnected])
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
