import { useMemo } from "react";
import { account as accountPerp } from "@orderly.network/perp";
import { useCollateral, useIndexPricesStream, useTokensInfo } from "..";
import { useHoldingStream } from "./useHoldingStream";

const { maxWithdrawalUSDC, maxWithdrawalOtherCollateral, collateralRatio } =
  accountPerp;

/**
 * The max withdrawal amount for the token
 * if token is not provided, return the max withdrawal amount for USDC
 */
export function useMaxWithdrawal(token?: string) {
  const { unsettledPnL, freeCollateral } = useCollateral();

  const tokensInfo = useTokensInfo();

  const { data: indexPrices } = useIndexPricesStream();
  const { usdc, data: holdings = [] } = useHoldingStream();

  const holding = holdings.find((item) => item?.token === token);

  const usdcBalance = usdc?.holding ?? 0;

  const indexPrice = useMemo(() => {
    if (token === "USDC") {
      return 1;
    }
    const symbol = `PERP_${token}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [token, indexPrices]);

  const memoizedCollateralRatio = useMemo(() => {
    const { base_weight, discount_factor } =
      tokensInfo?.find((item) => item?.token === token) ?? {};
    return collateralRatio({
      baseWeight: base_weight ?? 0,
      discountFactor: discount_factor ?? 0,
      collateralQty: holding?.holding ?? 0,
      indexPrice,
    });
  }, [holdings, tokensInfo, indexPrice, token, holding]);

  const maxAmount = useMemo(() => {
    if (token === "USDC") {
      return maxWithdrawalUSDC({
        USDCBalance: usdcBalance,
        freeCollateral,
        upnl: unsettledPnL ?? 0,
      });
    }
    return maxWithdrawalOtherCollateral({
      collateralQty: holding?.holding ?? 0,
      freeCollateral,
      indexPrice,
      weight: memoizedCollateralRatio,
    });
  }, [
    usdcBalance,
    freeCollateral,
    unsettledPnL,
    memoizedCollateralRatio,
    holdings,
    indexPrice,
    token,
    holding,
  ]);

  return maxAmount;
}
