import type { API } from "@orderly.network/types";

type NonUSDCHolding = {
  holding: number;
  indexPrice: number;
  // margin replacement rate, default 0
  collateralCap: number;
  discountFactor: number;
};

export const parseHolding = (
  holding: API.Holding[],
  indexPrices: Record<string, number>,
  tokensInfo: API.Chain[],
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
      const findToken = tokensInfo.find(({ token }) => token === item.token);
      nonUSDC.push({
        holding: item.holding,
        indexPrice: indexPrices[item.token] ?? 0,
        collateralCap: findToken?.user_max_qty ?? 0,
        discountFactor: findToken?.discount_factor ?? 0,
      });
    }
  });

  return [USDC_holding, nonUSDC];
};
