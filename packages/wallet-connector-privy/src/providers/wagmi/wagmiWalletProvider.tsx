import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Connector, useSwitchChain } from "wagmi";
import { useEventEmitter } from "@orderly.network/hooks";
import { ChainNamespace } from "@orderly.network/types";
import {
  getWalletConnectErrorMessage,
  WALLET_CONNECT_ERROR,
} from "../../connectEvents";
import { WalletConnectType } from "../../types";
import { useWagmiConnection } from "./useWagmiConnection";

interface WagmiWalletContextValue {
  connectors: Connector[];
  connect: (args: any) => void;
  wallet: any;
  connectedChain: { id: number; namespace: ChainNamespace } | null;
  setChain: (chainId: number) => Promise<any>;
  /**
   * Ends the local connection immediately; the connector's (possibly slow,
   * network-bound) cleanup keeps running in the background.
   */
  disconnect: () => Promise<void>;
  isConnected: boolean;
}

const WagmiWalletContext = createContext<WagmiWalletContextValue | null>(null);

const disabledWagmiWalletValue: WagmiWalletContextValue = {
  connectors: [],
  connect: () => {},
  wallet: undefined,
  connectedChain: null,
  setChain: () =>
    Promise.reject(new Error("Wagmi wallet connector is disabled")),
  disconnect: () => Promise.resolve(),
  isConnected: false,
};

export const WagmiWalletProvider: React.FC<{
  children: React.ReactNode;
  disabled: boolean;
}> = ({ children, disabled }) => {
  if (disabled) {
    return (
      <WagmiWalletContext.Provider value={disabledWagmiWalletValue}>
        {children}
      </WagmiWalletContext.Provider>
    );
  }

  return <EnabledWagmiWalletProvider>{children}</EnabledWagmiWalletProvider>;
};

const EnabledWagmiWalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wallet, setWallet] = useState<undefined | any>(undefined);
  const {
    connector,
    address,
    chainId,
    connectors: wagmiConnectors,
    isConnected,
    connect,
    disconnect,
  } = useWagmiConnection();
  const { switchChain } = useSwitchChain();
  const ee = useEventEmitter();

  const connectedChain = useMemo(() => {
    if (chainId && isConnected) {
      return {
        id: chainId,
        namespace: ChainNamespace.evm,
      };
    }
    return null;
  }, [chainId, isConnected]);

  const setChain = useCallback(
    (chainId: number) => {
      return new Promise((resolve, reject) => {
        switchChain(
          { chainId },
          {
            onSuccess: () => resolve(true),
            onError: (e) => {
              console.log("-- switch chain error", e);
              return reject(e);
            },
          },
        );
      });
    },
    [switchChain],
  );

  useEffect(() => {
    if (!connector || !isConnected) {
      setWallet(undefined);
      return;
    }
    const providerPromise = connector.getProvider?.();
    if (!providerPromise) {
      setWallet(undefined);
      ee.emit(WALLET_CONNECT_ERROR, {
        walletType: WalletConnectType.EVM,
        message: "Failed to initialize the wallet provider.",
      });
      return;
    }

    let active = true;
    providerPromise
      .then((provider) => {
        if (!active) {
          return;
        }
        setWallet({
          label: connector.name,
          icon: "",
          provider: provider,
          accounts: [
            {
              address: address,
            },
          ],
          chains: [
            {
              id: chainId,
              namespace: ChainNamespace.evm,
            },
          ],
          chain: connectedChain,
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setWallet(undefined);
        ee.emit(WALLET_CONNECT_ERROR, {
          walletType: WalletConnectType.EVM,
          message: getWalletConnectErrorMessage(
            error,
            "Failed to initialize the wallet provider.",
          ),
        });
      });
    return () => {
      active = false;
    };
  }, [address, chainId, connectedChain, connector, ee, isConnected]);

  const connectors = useMemo(() => {
    return wagmiConnectors
      .filter((connector: any) => connector.id !== "injected")
      .sort((a: any, b: any) =>
        a.type === "injected" ? -1 : 1,
      ) as Connector[];
  }, [wagmiConnectors]);

  const value = useMemo(
    () => ({
      connectors,
      connect,
      wallet: isConnected ? wallet : undefined,
      connectedChain,
      setChain,
      disconnect,
      isConnected,
    }),
    [
      connectors,
      connect,
      wallet,
      connectedChain,
      setChain,
      disconnect,
      isConnected,
    ],
  );

  return (
    <WagmiWalletContext.Provider value={value}>
      {children}
    </WagmiWalletContext.Provider>
  );
};

export function useWagmiWallet() {
  const context = useContext(WagmiWalletContext);
  if (!context) {
    throw new Error("useWagmiWallet must be used within a WagmiWalletProvider");
  }
  return context;
}
