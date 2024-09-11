import { API } from "@orderly.network/types";
import { CalculatorCtx, CalculatorScope } from "../../types";
import { BaseCalculator } from "./baseCalculator";
import { account } from "@orderly.network/perp";
import { pathOr } from "ramda";
import { parseHolding } from "../../utils/parseHolding";
import { Portfolio, useAppStore } from "../appStore";
import { Decimal } from "@orderly.network/utils";
import { createGetter } from "../../utils/createGetter";
// import { useHoldingStore } from "../../store";
class PortfolioCalculator extends BaseCalculator<any> {
  name = "portfolio";

  calc(scope: CalculatorScope, data: any, ctx: CalculatorCtx) {
    // console.log(
    //   "!!!! calc",

    //   ctx.get((output: Record<string, any>) => output)
    // );
    const positions = ctx.get(
      (output: Record<string, any>) => output.positionCalculator
    );

    let holding = ctx.holding;
    const markPrices = ctx.markPrices;
    const accountInfo = ctx.accountInfo;
    const symbolsInfo = ctx.symbolsInfo;

    if (!holding || !positions || !markPrices) {
      return null;
    }

    const unsettlementPnL = pathOr(0, ["unsettled_pnl"])(positions);
    const unrealizedPnL = pathOr(0, ["unrealized_pnl"])(positions);

    const [USDC_holding, nonUSDC] = parseHolding(holding, data);

    const totalCollateral = account.totalCollateral({
      USDCHolding: USDC_holding,
      nonUSDCHolding: nonUSDC,
      unsettlementPnL: unsettlementPnL,
    });

    const totalValue = account.totalValue({
      totalUnsettlementPnL: unsettlementPnL,
      USDCHolding: USDC_holding,
      nonUSDCHolding: nonUSDC,
    });

    const totalUnrealizedROI = account.totalUnrealizedROI({
      totalUnrealizedPnL: unrealizedPnL,
      totalValue: totalValue.toNumber(),
    });

    const totalInitialMarginWithOrders = account.totalInitialMarginWithQty({
      positions: positions.rows,
      markPrices,
      IMR_Factors: accountInfo.imr_factor,
      maxLeverage: accountInfo.max_leverage,
      symbolInfo: createGetter({ ...symbolsInfo }),
    });

    const freeCollateral = account.freeCollateral({
      totalCollateral,
      totalInitialMarginWithOrders,
    });

    return {
      totalCollateral,
      totalValue,
      totalUnrealizedROI,
      freeCollateral,
    };
  }

  update(data: { [K in keyof Portfolio]: number | Decimal } | null) {
    if (!!data) {
      useAppStore.getState().actions.batchUpdateForPortfolio({
        totalCollateral: (data.totalCollateral as Decimal).toNumber(),
        totalValue: (data.totalValue as Decimal).toNumber(),
        freeCollateral: (data.freeCollateral as Decimal).toNumber(),
        // totalUnrealizedROI: data.totalUnrealizedROI as number,
      });
    }
  }
}

export { PortfolioCalculator };
