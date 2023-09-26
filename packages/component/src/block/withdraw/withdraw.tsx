import { FC, useContext, useMemo } from "react";
import { WithdrawForm } from "./withdrawForm";
import { useChain, useWithdraw } from "@orderly.network/hooks";
import { WalletConnectorContext } from "@/provider";

export interface WithdrawProps {
  onCancel?: () => void;
  onOk?: () => void;
}

export const Withdraw: FC<WithdrawProps> = (props) => {
  //   const { state } = useAccount();
  const { connectedChain, wallet, setChain } = useContext(
    WalletConnectorContext
  );

  const { chains } = useChain("USDC");

  const { maxAmount, availableBalance, unsettledPnL, withdraw } = useWithdraw();

  const currentChain = useMemo(() => {
    if (!connectedChain) return null;
    return {
      ...connectedChain,
      id: parseInt(connectedChain?.id),
    };
  }, [connectedChain]);

  return (
    <WithdrawForm
      address={wallet?.accounts?.[0].address}
      chain={currentChain}
      chains={chains?.chain_details}
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
