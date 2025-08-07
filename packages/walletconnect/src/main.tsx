import React from "react";
import { useMemo } from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useAccount,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
  useWalletClient,
  usePublicClient,
} from "wagmi";
import { WalletConnectorContext } from "@orderly.network/hooks";
import type { WalletConnectorContextState } from "@orderly.network/hooks";

export const Main: React.FC<React.PropsWithChildren> = (props) => {
  const { open } = useWeb3Modal();
  const { address, isConnecting } = useAccount();
  const { disconnect: __disconnect, disconnectAsync } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { isLoading, switchNetwork } = useSwitchNetwork();

  const publicClient = usePublicClient();

  const { data: walletClient } = useWalletClient();

  const connect = () => {
    return new Promise((resolve, reject) => {
      return open()
        .then((args) => {
          resolve([]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const disconnect = (wallet: { chains: { id: number }[] }) => {
    return Promise.resolve().then(() => {
      return disconnectAsync();
    });
  };

  const connectedChain = useMemo(() => {
    if (!chain || !chain?.id) {
      return null;
    }
    return {
      id: chain.id,
    };
  }, [chain]);

  const setChain = (options: { chainId: number }) => {
    return Promise.resolve().then(() => {
      switchNetwork?.(options.chainId);
    });
  };

  const wallet = useMemo(() => {
    if (!address || !connectedChain) {
      return null;
    }

    return {
      label: "string",
      icon: "string",
      // provider: publicClient,
      provider: walletClient?.transport,
      // provider: EIP1193Provider,
      accounts: [
        {
          address,
          balance: "string",
        },
      ],
      chains: [connectedChain],
      // instance?: unknown,
    };
  }, [address, connectedChain, publicClient, walletClient]);

  const memoizedValue = useMemo<WalletConnectorContextState>(() => {
    return {
      connect: connect as any,
      disconnect: disconnect as any,
      connecting: isConnecting,
      wallet: wallet as any,
      setChain: setChain as any,
      chains,
      connectedChain: connectedChain as any,
      settingChain: isLoading,
      namespace: undefined as any,
    };
  }, [
    connect,
    disconnect,
    isConnecting,
    wallet,
    setChain,
    chains,
    connectedChain,
    isLoading,
  ]);

  return (
    <WalletConnectorContext.Provider value={memoizedValue}>
      {props.children}
    </WalletConnectorContext.Provider>
  );
};
