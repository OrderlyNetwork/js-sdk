"use client";

import { FC, useContext, useEffect, useMemo, useState } from "react";
import { DepositForm } from "./depositForm";
import { WalletConnectorContext } from "@/provider";
import { useChain, useDeposit, useChains } from "@orderly.network/hooks";
import { API, CurrentChain } from "@orderly.network/types";
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

  const [needCrossChain, setNeedCrossChain] = useState<boolean>(false);
  const [needSwap, setNeedSwap] = useState<boolean>(false);

  const [_, { findByChainId }] = useChains("", {
    wooSwapEnabled: true,
  });

  const { connectedChain, wallet, setChain, settingChain } = useContext(
    WalletConnectorContext
  );

  const { onEnquiry } = useContext(AssetsContext);

  const { chains } = useChain("USDC");
  const [token, setToken] = useState<API.TokenInfo>();

  const currentChain = useMemo<CurrentChain | null>(() => {
    if (!connectedChain) return null;

    const chainId = parseInt(connectedChain.id);
    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain,
    };
  }, [connectedChain, findByChainId]);
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
    vaultAddress: needCrossChain
      ? currentChain?.info?.network_infos.woofi_dex_cross_chain_router
      : needSwap
      ? currentChain?.info.network_infos.woofi_dex_depositor
      : undefined,
  });

  useEffect(() => {
    if (!token || !currentChain) return;
    /// check if need swap

    if (token.symbol !== "USDC") {
      setNeedSwap(true);
    } else {
      setNeedSwap(false);
    }

    if (currentChain?.id !== dst.chainId) {
      setNeedCrossChain(true);
      setNeedSwap(true);
    } else {
      setNeedCrossChain(false);
    }
  }, [token?.symbol, currentChain?.id, dst.chainId]);

  console.log("needCrossChain", currentChain, dst, needCrossChain, needSwap);

  return (
    <DepositForm
      dst={dst}
      allowance={allowance}
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      walletName={wallet?.label}
      switchChain={setChain}
      // switchChain={switchChain}
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
      needCrossChain={needCrossChain}
      needSwap={needSwap}
    />
  );
};
