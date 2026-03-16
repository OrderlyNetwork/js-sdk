import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Adapter,
  WalletAdapterNetwork,
  WalletError,
  WalletNotReadyError,
} from "@solana/wallet-adapter-base";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useEventEmitter } from "@orderly.network/hooks";
import { useWalletConnectorPrivy } from "../../provider";
import { InitSolana } from "../../types";

interface IProps extends PropsWithChildren<InitSolana> {}

export function InitSolanaProvider({
  mainnetRpc,
  devnetRpc,
  wallets: walletsProp,
  onError,
  children,
}: IProps) {
  const ee = useEventEmitter();
  const { network, setSolanaInfo, connectorWalletType } =
    useWalletConnectorPrivy();
  if (connectorWalletType.disableSolana) {
    return children;
  }

  const wallets = useMemo(() => {
    return walletsProp ?? [new PhantomWalletAdapter()];
  }, [walletsProp]);

  useEffect(() => {
    let rpcUrl = null;
    if (network === "mainnet") {
      rpcUrl = mainnetRpc ?? null;
    } else {
      rpcUrl = devnetRpc ?? null;
    }
    setSolanaInfo({
      rpcUrl: rpcUrl,
      network:
        network === "mainnet"
          ? WalletAdapterNetwork.Mainnet
          : WalletAdapterNetwork.Devnet,
    });
  }, [network, mainnetRpc, devnetRpc, setSolanaInfo]);

  const handleOnError = useCallback(
    (error: WalletError, adapter?: Adapter) => {
      if (error.name === "WalletAccountError") {
        ee.emit("wallet:connect-error", {
          message: "Please switch to a wallet with Solana address.",
        });
        return;
      }
      onError?.(error, adapter);
    },
    [ee, onError],
  );

  return (
    <WalletProvider wallets={wallets} onError={handleOnError} autoConnect>
      {children}
    </WalletProvider>
  );
}
