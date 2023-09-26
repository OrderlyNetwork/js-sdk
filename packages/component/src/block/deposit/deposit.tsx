"use client";

import { FC, useCallback, useContext, useMemo, useState } from "react";

import { Chain, Wallet } from "@/block/pickers/walletPicker/walletPicker";

import { DepositForm } from "./depositForm";
import { WalletConnectorContext } from "@/provider";
import { useChain, useDeposit } from "@orderly.network/hooks";

export enum DepositStatus {
  // NotSupported = "NotSupported",
  // NotConnected = "NotConnected",
  Checking = "Checking",
  // Unsettle = "Unsettle",
  InsufficientBalance = "InsufficientBalance",
  Normal = "Normal",
}

export interface DepositProps {
  // accountStatus: AccountStatus;
  onDeposit?: () => void;
  availableTokens?: string[];

  availableNetworks?: string[];
  availableBalance?: number;
  wallet?: Wallet;
  activeChain?: Chain;
  status?: DepositStatus;

  onConnectWallet?: () => void;
}

export const Deposit: FC<DepositProps> = (props) => {
  const { connectedChain, wallet, setChain } = useContext(
    WalletConnectorContext
  );

  const { chains } = useChain("USDC");

  const currentChain = useMemo(() => {
    if (!connectedChain) return null;
    return {
      ...connectedChain,
      id: parseInt(connectedChain?.id),
    };
  }, [connectedChain]);

  const { balance, allowance, approve, deposit } = useDeposit();

  console.log({ balance, allowance });

  return (
    <DepositForm
      allowance={allowance}
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      chains={chains?.chain_details}
      walletName={wallet?.label}
      switchChain={setChain}
      decimals={chains?.decimals ?? 2}
      minAmount={0}
      maxAmount={balance}
      approve={approve}
      deposit={deposit}
    />
  );
};
