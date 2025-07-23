import { useMemo } from "react";
import { account as accountPerp } from "@orderly.network/perp";
import { Decimal } from "@orderly.network/utils";
import { useCollateral, useIndexPricesStream, useTokenInfo } from "..";
import { useHoldingStream } from "./useHoldingStream";

const { maxWithdrawalUSDC, maxWithdrawalOtherCollateral, collateralRatio } =
  accountPerp;

/**
 * The max withdrawal amount for the token
 * if token is not provided, return the max withdrawal amount for USDC
 */
export const useMaxWithdrawal = (token: string) => {
  const { unsettledPnL, freeCollateral } = useCollateral();

  const tokenInfo = useTokenInfo(token);

  const { data: indexPrices } = useIndexPricesStream();
  const { usdc, data: holdings = [] } = useHoldingStream();

  const holding = useMemo(() => {
    return holdings.find(
      (item) => item.token?.toUpperCase() === token.toUpperCase(),
    );
  }, [holdings, token]);

  const usdcBalance = usdc?.holding ?? 0;

  const indexPrice = useMemo(() => {
    if (token === "USDC") {
      return 1;
    }
    const symbol = `PERP_${token}_USDC`;
    return indexPrices[symbol] ?? 0;
  }, [token, indexPrices]);

  const memoizedCollateralRatio = useMemo(() => {
    const { base_weight = 0, discount_factor = 0 } = tokenInfo || {};
    const holdingQty = holding?.holding ?? 0;
    return collateralRatio({
      baseWeight: base_weight,
      discountFactor: discount_factor,
      collateralQty: holdingQty,
      collateralCap: tokenInfo?.user_max_qty ?? holdingQty,
      indexPrice,
    });
  }, [tokenInfo, indexPrice, holding]);

  const maxAmount = useMemo<number>(() => {
    if (!token) {
      return 0;
    }

    let quantity = 0;

    if (token === "USDC") {
      quantity = maxWithdrawalUSDC({
        USDCBalance: usdcBalance,
        freeCollateral: freeCollateral,
        upnl: unsettledPnL ?? 0,
      });
    } else {
      quantity = maxWithdrawalOtherCollateral({
        collateralQty: holding?.holding ?? 0,
        freeCollateral: freeCollateral,
        indexPrice,
        weight: memoizedCollateralRatio,
      });
    }

    if (Number.isNaN(quantity)) {
      return 0;
    }

    if (tokenInfo?.decimals === undefined) {
      return quantity;
    }

    return new Decimal(quantity || 0).todp(tokenInfo.decimals).toNumber();
  }, [
    usdcBalance,
    freeCollateral,
    unsettledPnL,
    memoizedCollateralRatio,
    indexPrice,
    token,
    holding,
    tokenInfo?.decimals,
  ]);

  return maxAmount;
};
