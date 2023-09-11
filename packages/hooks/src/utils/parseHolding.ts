import { API } from "@orderly.network/types";

type NonUSDCHolding = {
  holding: number;
  markPrice: number;
  //保證金替代率 暂时默认0
  discount: number;
};

export const parseHolding = (
  holding: API.Holding[],
  markPrices: Record<string, number>
): [number, NonUSDCHolding[]] => {
  // if (!holding || !markPrices) {
  //     return [zero, zero];
  //   }
  const nonUSDC: NonUSDCHolding[] = [];

  let USDC_holding = 0;

  holding.forEach((item) => {
    if (item.token === "USDC") {
      USDC_holding = item.holding;
    } else {
      nonUSDC.push({
        holding: item.holding,
        markPrice: markPrices[item.token] ?? 0,
        // markPrice: 0,
        discount: 0,
      });
    }
  });

  return [USDC_holding, nonUSDC];
};
