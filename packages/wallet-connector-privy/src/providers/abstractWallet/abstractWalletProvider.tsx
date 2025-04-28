import React, { useCallback, useEffect, useState } from "react";
import {
  useAbstractClient,
  useGlobalWalletSignerAccount,
  useLoginWithAbstract,
} from "@abstract-foundation/agw-react";
import { transformEIP1193Provider } from "@abstract-foundation/agw-client";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import { ConnectedChain, WalletState } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import { useWalletConnectorPrivy } from "../../provider";
import { useAccount } from "wagmi";
import { windowGuard } from "@orderly.network/utils";
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
  const { network } = useWalletConnectorPrivy();
  const { login, logout } = useLoginWithAbstract();
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const { data: client } = useAbstractClient();
  const { connector } = useAccount();
  const { address, status } = useGlobalWalletSignerAccount();


  const connect = () => {
    return login();
  };

  const disconnect = () => {
    return logout();
  };

  const isConnected = useMemo(() => {
    return !!(client && connector);
  }, [client, connector]);

  const connectedChain = useMemo(() => {
    if (!client || !connector) {
      return null;
    }
    return {
      id: client.chain.id,
      namespace: ChainNamespace.evm,
    };
  }, [client, connector]);

  const value = useMemo(
    () => ({
      isConnected,
      connect,
      disconnect,
      wallet,
      connectedChain,
    }),
    [connect, disconnect, isConnected, wallet, connectedChain]
  );

  useEffect(() => {
    console.log("xxx client", client);
    if (!client || !connector) {
      setWallet(null);
      return;
    }
    connector?.getProvider().then((provider: any) => {
      console.log("xxx abstract wallet in wagmi provider", provider);
      const tempWallet = {
        label: "AGW",
        icon: "",
        provider: provider,
        accounts: [
          {
            address: address,
          },
        ],
        chains: [
          {
            id: client.chain.id,
            namespace: ChainNamespace.evm,
          },
        ],
        chain: connectedChain,
      };
      console.log("-- abstract wallet tempWallet", tempWallet);
      setWallet(tempWallet as unknown as WalletState);
    });
  }, [client, connectedChain, connector, address]);

  useEffect(() => {
    windowGuard(() => {
      const connection = localStorage.getItem(
        "privy-caw:cm04asygd041fmry9zmcyn5o5:connection"
      );
      if (connection) {
        login();
      }
    });
  }, []);
  return (
    <AbstractWalletContext.Provider value={value}>
      {props.children}
    </AbstractWalletContext.Provider>
  );
};

export function useAbstractWallet() {
  const context = useContext(AbstractWalletContext);
  if (!context) {
    throw new Error(
      "useAbstractWallet must be used within a AbstractWalletProvider"
    );
  }
  return context;
}
