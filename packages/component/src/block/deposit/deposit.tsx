"use client";

import { FC, useContext, useMemo, useState } from "react";
import { DepositForm } from "./depositForm";
import { WalletConnectorContext } from "@/provider";
import { useChain, useDeposit } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { AssetsContext } from "@/provider/assetsProvider";

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
  // const { dst } = props;

  const { connectedChain, wallet, setChain, settingChain } = useContext(
    WalletConnectorContext
  );

  const { onEnquiry } = useContext(AssetsContext);

  const { chains } = useChain("USDC");
  const [token, setToken] = useState<API.TokenInfo>();

  const currentChain = useMemo(() => {
    if (!connectedChain) return null;
    return {
      ...connectedChain,
      id: parseInt(connectedChain?.id),
    };
  }, [connectedChain]);

  console.log("currentToken", token);

  const {
    dst,
    balance,
    allowance,
    approve,
    deposit,
    isNativeToken,
    balanceRevalidating,
    fetchBalance,
  } = useDeposit({
    address: token?.address,
    decimals: token?.decimals,
  });

  return (
    <DepositForm
      dst={dst}
      allowance={allowance}
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      walletName={wallet?.label}
      switchChain={setChain}
      decimals={chains?.decimals ?? 2}
      displayDecimals={2}
      switchToken={setToken}
      token={token}
      isNativeToken={isNativeToken}
      minAmount={0}
      maxAmount={balance}
      approve={approve}
      deposit={deposit}
      fetchBalance={fetchBalance}
      onOk={props.onOk}
      balanceRevalidating={balanceRevalidating}
      settingChain={settingChain}
      onEnquiry={onEnquiry}
    />
  );
};
