import { FC, useContext, useMemo } from "react";
import { WithdrawForm } from "./withdrawForm";
import {
  useChain,
  useWithdraw,
  useChains,
  OrderlyContext,
} from "@orderly.network/hooks";
import { WalletConnectorContext } from "@/provider";
import { CurrentChain } from "@orderly.network/types";

export interface WithdrawProps {
  onCancel?: () => void;
  onOk?: () => void;
}

export const Withdraw: FC<WithdrawProps> = (props) => {
  //   const { state } = useAccount();
  const { connectedChain, wallet, setChain } = useContext(
    WalletConnectorContext
  );

  const { networkId } = useContext(OrderlyContext);

  // const { chains } = useChain("USDC");
  const [chains, { findByChainId }] = useChains(networkId, {
    wooSwapEnabled: false,
    pick: "network_infos",
  });

  console.log("chains", chains);

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

  const { maxAmount, availableBalance, unsettledPnL, withdraw } = useWithdraw();

  return (
    <WithdrawForm
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      chains={chains}
      walletName={wallet?.label}
      switchChain={setChain}
      decimals={chains?.decimals ?? 2}
      minAmount={chains?.minimum_withdraw_amount ?? 1}
      maxAmount={maxAmount}
      availableBalance={availableBalance}
      unsettledPnL={unsettledPnL}
      onWithdraw={withdraw}
      onOk={props.onOk}
    />
  );
};
