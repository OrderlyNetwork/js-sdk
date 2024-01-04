import type { FC, PropsWithChildren } from "react";
import { useMemo } from "react";
import { WalletConnectorContext } from "@orderly.network/hooks";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  useAccount,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
  useWalletClient,
  usePublicClient,
} from "wagmi";

export const Main: FC<PropsWithChildren> = (props) => {
  const { open } = useWeb3Modal();
  const { address, isConnecting, isDisconnected, connector } = useAccount();
  const { disconnect: __disconnect, disconnectAsync } = useDisconnect();
  const { chain, chains } = useNetwork();
  const { error, isLoading, pendingChainId, switchNetwork } =
    useSwitchNetwork();

  const publicClient = usePublicClient();

  const { data: walletClient, isError } = useWalletClient();

  const connect = () => {
    return new Promise((resolve, reject) => {
      return open()
        .then((args) => {
          // resolve(provider);
          console.log("connect success", args);
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
    if (!chain || !chain?.id) return null;
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
    if (!address || !connectedChain) return null;

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

  return (
    <WalletConnectorContext.Provider
      value={{
        connect,
        disconnect,
        connecting: isConnecting,
        wallet,
        setChain,
        chains,
        connectedChain,
        settingChain: isLoading,
      }}
    >
      {props.children}
    </WalletConnectorContext.Provider>
  );
};
