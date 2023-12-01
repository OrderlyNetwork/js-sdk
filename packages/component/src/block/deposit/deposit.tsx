import { FC, useContext, useEffect, useMemo, useState } from "react";
import { DepositForm } from "./depositForm";
// import { WalletConnectorContext } from "@/provider";
import {
  useChain,
  useDeposit,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import { API, CurrentChain } from "@orderly.network/types";
import { AssetsContext } from "@/provider/assetsProvider";
import { OrderlyAppContext } from "@/provider";

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
  const { enableSwapDeposit } = useContext(OrderlyAppContext);

  // @ts-ignore
  const [chains, { findByChainId }] = useChains(undefined, {
    wooSwapEnabled: enableSwapDeposit,
    pick: "network_infos",
  });

  const { connectedChain, wallet, setChain, settingChain } = useWalletConnector();

  const { onEnquiry } = useContext(AssetsContext);

  // const { chains } = useChain("USDC");
  const [token, setToken] = useState<API.TokenInfo>();
  // @ts-ignore
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
    srcChainId: currentChain?.id,
    srcToken: token?.symbol,
    crossChainRouteAddress:
      currentChain?.info?.network_infos?.woofi_dex_cross_chain_router,
    depositorAddress: currentChain?.info?.network_infos?.woofi_dex_depositor,
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
  }, [token?.symbol, currentChain?.id, dst?.chainId]);

  return (
    <DepositForm
      // @ts-ignore
      dst={dst}
      allowance={allowance}
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      // @ts-ignore
      chains={chains}
      walletName={wallet?.label}
      switchChain={setChain}
      // switchChain={switchChain}
      // decimals={chains?.decimals ?? 2}
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
