import { FC, useContext, useMemo } from "react";
import { WithdrawForm } from "./withdrawForm";
import {
  useWithdraw,
  useChains,
  usePositionStream,
  useWalletConnector,
} from "@orderly.network/hooks";
import { CurrentChain, NetworkId } from "@orderly.network/types";
import { TradingPageContext } from "@/page";
import { useConfig } from "@orderly.network/hooks";

export interface WithdrawProps {
  onCancel?: () => void;
  onOk?: () => void;
}

export const Withdraw: FC<WithdrawProps> = (props) => {
  const { connectedChain, wallet, setChain } = useWalletConnector();

  const networkId = useConfig("networkId");

  const [chains, { findByChainId }] = useChains(networkId as NetworkId, {
    wooSwapEnabled: false,
    pick: "network_infos",
  });

  // @ts-ignore
  const currentChain = useMemo<CurrentChain | null>(() => {
    if (!connectedChain) return null;

    // const chainId = parseInt(connectedChain.id);
    const { id: chainId } = connectedChain;
    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain,
    };
  }, [connectedChain, findByChainId]);

  const {
    maxAmount,
    availableBalance,
    availableWithdraw,
    unsettledPnL,
    withdraw,
  } = useWithdraw();
  const context = useContext(TradingPageContext);
  const symbol = context.symbol;
  const [data] = usePositionStream(symbol);
  const hasPositions = data?.rows?.length! > 0;

  return (
    <WithdrawForm
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      // @ts-ignore
      chains={chains}
      walletName={wallet?.label}
      switchChain={setChain}
      // @ts-ignore
      decimals={chains?.decimals ?? 2}
      // @ts-ignore
      minAmount={chains?.minimum_withdraw_amount ?? 1}
      maxAmount={maxAmount}
      availableBalance={availableBalance}
      unsettledPnL={unsettledPnL}
      hasPositions={hasPositions}
      onWithdraw={withdraw}
      onOk={props.onOk}
    />
  );
};
