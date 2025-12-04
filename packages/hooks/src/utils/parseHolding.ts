import { account } from "@veltodefi/perp";
import type { API } from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";

type NonUSDCHolding = {
  holding: number;
  indexPrice: number;
  // margin replacement rate, default 0
  collateralCap: number;
  collateralRatio: Decimal;
};

export const parseHolding = (
  holding: API.Holding[] | ReadonlyArray<API.Holding>,
  indexPrices: Record<string, number>,
  tokensInfo: API.Token[] | ReadonlyArray<API.Token>,
): [number, NonUSDCHolding[]] => {
  // if (!holding || !indexPrices) {
  //   return [zero, zero];
  // }
  const nonUSDC: NonUSDCHolding[] = [];

  let USDC_holding = 0;

  holding.forEach((item) => {
    if (item.token === "USDC") {
      USDC_holding = item.holding;
    } else {
      const tokenInfo = tokensInfo.find(({ token }) => token === item.token);
      const {
        base_weight = 0,
        discount_factor = 0,
        user_max_qty = 0,
      } = tokenInfo || {};

      const holdingQty = item?.holding ?? 0;

      const indexPrice = indexPrices[`PERP_${item.token}_USDC`] ?? 0;

      const collateralRatio = account.collateralRatio({
        baseWeight: base_weight,
        discountFactor: discount_factor,
        collateralQty: holdingQty,
        collateralCap: user_max_qty,
        indexPrice,
      });

      nonUSDC.push({
        holding: holdingQty,
        indexPrice,
        collateralCap: user_max_qty,
        collateralRatio: collateralRatio,
      });
    }
  });

  return [USDC_holding, nonUSDC];
};
