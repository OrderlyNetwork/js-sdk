"use client";

import { FC, useContext, useMemo, useState } from "react";
import { DepositForm } from "./depositForm";
import { WalletConnectorContext } from "@/provider";
import { useChain, useDeposit } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

export enum DepositStatus {
  Checking = "Checking",
  InsufficientBalance = "InsufficientBalance",
  Normal = "Normal",
}

export interface DepositProps {
  onCancel?: () => void;
  onOk?: () => void;
  wooSwapEnabled?: boolean;
}

export const Deposit: FC<DepositProps> = (props) => {
  const { wooSwapEnabled } = props;

  const { connectedChain, wallet, setChain, switchChain, settingChain } =
    useContext(WalletConnectorContext);

  const { chains } = useChain("USDC");
  const [token, setToken] = useState<API.TokenInfo>();

  const currentChain = useMemo(() => {
    if (!connectedChain) return null;
    return {
      ...connectedChain,
      id: parseInt(connectedChain?.id),
    };
  }, [connectedChain]);

  const {
    balance,
    allowance,
    approve,
    deposit,
    balanceRevalidating,
    fetchBalance,
  } = useDeposit({
    address: token?.address,
  });

  return (
    <DepositForm
      allowance={allowance}
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      walletName={wallet?.label}
      switchChain={setChain}
      // switchChain={switchChain}
      decimals={chains?.decimals ?? 2}
      switchToken={setToken}
      token={token}
      minAmount={0}
      maxAmount={balance}
      approve={approve}
      deposit={deposit}
      fetchBalance={fetchBalance}
      onOk={props.onOk}
      balanceRevalidating={balanceRevalidating}
      settingChain={settingChain}
    />
  );
};
