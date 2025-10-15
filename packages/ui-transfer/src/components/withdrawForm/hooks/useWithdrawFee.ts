import { useMemo } from "react";
import { useTokenInfo } from "@orderly.network/hooks";
import { WithdrawTo } from "../../../types";
import { CurrentChain } from "../../depositForm/hooks";

export function useWithdrawFee(options: {
  token: string;
  currentChain?: CurrentChain | null;
  crossChainWithdraw: boolean;
  withdrawTo: WithdrawTo;
}) {
  const { crossChainWithdraw, currentChain, token, withdrawTo } = options;

  const tokenInfo = useTokenInfo(token);

  const fee = useMemo(() => {
    if (withdrawTo === WithdrawTo.Account) {
      return 0;
    }

    if (!currentChain) {
      return 0;
    }

    const item = tokenInfo?.chain_details?.find(
      (chain) => Number.parseInt(chain.chain_id) === currentChain.id,
    );

    if (!item) {
      return 0;
    }

    if (crossChainWithdraw) {
      return (
        (item.withdrawal_fee || 0) + (item.cross_chain_withdrawal_fee || 0)
      );
    }

    return item.withdrawal_fee || 0;
  }, [tokenInfo, token, currentChain, crossChainWithdraw, withdrawTo]);

  return fee;
}
