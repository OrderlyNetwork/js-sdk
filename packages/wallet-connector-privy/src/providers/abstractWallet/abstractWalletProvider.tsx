import React, { useEffect, useState } from "react";
import { createContext, PropsWithChildren, useContext, useMemo } from "react";
import {
  useAbstractClient,
  useGlobalWalletSignerAccount,
  useLoginWithAbstract,
} from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { ConnectedChain } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import { windowGuard } from "@orderly.network/utils";
import { useWalletConnectorPrivy } from "../../provider";
import { AbstractChainsMap, IWalletState } from "../../types";

interface AbstractWalletContextValue {
  connect: () => void;
  isConnected: boolean;
  disconnect: () => void;
  wallet: IWalletState | null;
  connectedChain: ConnectedChain | undefined;
}

const AbstractWalletContext = createContext<AbstractWalletContextValue | null>(
  null,
);

const disabledAbstractWalletValue: AbstractWalletContextValue = {
  connect: () => {},
  isConnected: false,
  disconnect: () => {},
  wallet: null,
  connectedChain: undefined,
};

export const AbstractWalletProvider = (
  props: PropsWithChildren<{ disabled: boolean }>,
) => {
  if (props.disabled) {
    return (
      <AbstractWalletContext.Provider value={disabledAbstractWalletValue}>
        {props.children}
      </AbstractWalletContext.Provider>
    );
  }

  return (
    <EnabledAbstractWalletProvider>
      {props.children}
    </EnabledAbstractWalletProvider>
  );
};

const EnabledAbstractWalletProvider = (props: PropsWithChildren) => {
  const { network } = useWalletConnectorPrivy();
  const { login, logout } = useLoginWithAbstract();
  const [wallet, setWallet] = useState<IWalletState | null>(null);
  const { data: client } = useAbstractClient();
  const { connector } = useAccount();
  const { address } = useGlobalWalletSignerAccount();

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
      return;
    }
    return {
      id: AbstractChainsMap.get(network)!,
      namespace: ChainNamespace.evm,
    };
  }, [client, connector, network]);

  const value = useMemo(
    () => ({
      isConnected,
      connect,
      disconnect,
      wallet,
      connectedChain,
    }),
    [connect, disconnect, isConnected, wallet, connectedChain],
  );

  useEffect(() => {
    if (!client || !connector || !address) {
      setWallet(null);
      return;
    }
    connector?.getProvider().then((provider: any) => {
      console.log("xxx abstract wallet in wagmi provider", provider);
      const tempWallet: IWalletState = {
        label: "AGW",
        icon: "",
        provider: {
          ...provider,
          agwWallet: true,
          sendTransaction: async (params: any) => {
            console.log("--- agw wallet sendTransaction", params);
            return client.sendTransaction(params);
          },
          writeContract: async (params: any) => {
            console.log("--- agw wallet writeContract", params);
            return client.writeContract(params);
          },
        },
        accounts: [
          {
            address: address,
          },
        ],
        chains: [
          {
            id: AbstractChainsMap.get(network)!,
            namespace: ChainNamespace.evm,
          },
        ],
        chain: connectedChain,
        additionalInfo: {
          AGWAddress: client.account.address,
        },
      };
      console.log("-- abstract wallet tempWallet", tempWallet);
      setWallet(tempWallet);
    });
  }, [client, connectedChain, connector, address, network]);

  useEffect(() => {
    windowGuard(() => {
      const connection = localStorage.getItem(
        "privy-caw:cm04asygd041fmry9zmcyn5o5:connection",
      );
      if (connection) {
        login();
      }
    });
  }, [login]);
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
      "useAbstractWallet must be used within a AbstractWalletProvider",
    );
  }
  return context;
}
