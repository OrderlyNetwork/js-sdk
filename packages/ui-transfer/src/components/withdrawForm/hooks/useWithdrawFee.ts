import { useMemo } from "react";
import { useTokenInfo } from "@kodiak-finance/orderly-hooks";
import { CurrentChain } from "../../depositForm/hooks";

export function useWithdrawFee(options: {
  token: string;
  currentChain?: CurrentChain | null;
  crossChainWithdraw: boolean;
}) {
  const { crossChainWithdraw, currentChain, token } = options;

  const tokenInfo = useTokenInfo(token);

  const fee = useMemo(() => {
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
  }, [tokenInfo, token, currentChain, crossChainWithdraw]);

  return fee;
}
