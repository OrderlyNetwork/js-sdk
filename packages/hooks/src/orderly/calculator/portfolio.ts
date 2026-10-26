import { API, EMPTY_LIST } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { CalculatorCtx, CalculatorScope } from "../../types";
import { mergeHoldingBalance } from "../../utils/mergeHoldingBalance";
import { Portfolio, useAppStore } from "../appStore";
import { BaseCalculator } from "./baseCalculator";
import { formatPortfolio, type PortfolioInputs } from "./formatPortfolio";
import { IndexPriceCalculatorName } from "./indexPrice";
import { MarketCalculatorName } from "./markPrice";

export const PortfolioCalculatorName = "portfolio";

class PortfolioCalculator extends BaseCalculator<any> {
  name = PortfolioCalculatorName;

  calc(scope: CalculatorScope, data: any, ctx: CalculatorCtx) {
    let markPrices: Record<PropertyKey, number>;
    let indexPrices: Record<PropertyKey, number>;
    const portfolio = this.getPortfolio(ctx);

    if (scope === CalculatorScope.MARK_PRICE) {
      markPrices = data;
    } else {
      markPrices = ctx.get<Record<string, number>>(
        (cache) => cache[MarketCalculatorName],
      );
    }

    if (scope === CalculatorScope.INDEX_PRICE) {
      indexPrices = data;
    } else {
      indexPrices = ctx.get<Record<string, number>>(
        (cache) => cache[IndexPriceCalculatorName],
      );
    }

    // if (scope === CalculatorScope.POSITION) {
    //   positions = data;
    // } else {
    const positions = ctx.get<API.PositionsTPSLExt>(
      (output: Record<string, any>) => output.positionCalculator_all,
    );
    // }

    let holding = portfolio.holding;

    if (
      scope === CalculatorScope.PORTFOLIO &&
      data.holding &&
      Array.isArray(holding)
    ) {
      if (Array.isArray(data.holding)) {
        holding = data.holding;
      } else {
        holding = holding.map((item) => {
          if (data.holding[item.token]) {
            return mergeHoldingBalance(item, data.holding[item.token]);
          }

          return item;
        });
      }
    }

    const accountInfo = ctx.accountInfo!;
    const symbolsInfo = ctx.symbolsInfo!;
    const tokensInfo = ctx.tokensInfo;

    return this.format({
      holding,
      positions,
      markPrices,
      accountInfo,
      symbolsInfo,
      perpSymbolsInfo: ctx.perpSymbolsInfo,
      indexPrices: indexPrices,
      tokensInfo: tokensInfo ?? EMPTY_LIST,
    });
  }

  private getPortfolio(ctx: CalculatorCtx) {
    return (
      ctx.get<Portfolio>((output) => output[this.name]) ||
      useAppStore.getState().portfolio
    );
  }

  private format(inputs: PortfolioInputs) {
    return formatPortfolio(inputs);
  }

  update(
    data: { [K in keyof Portfolio]: number | Decimal } | null,
    scope: CalculatorScope,
  ) {
    if (data) {
      useAppStore.getState().actions.batchUpdateForPortfolio({
        totalCollateral: data.totalCollateral as Decimal,
        totalValue: data.totalValue as Decimal,
        freeCollateral: data.freeCollateral as Decimal,
        freeCollateralUSDCOnly: data.freeCollateralUSDCOnly as Decimal,
        availableBalance: data.availableBalance as number,
        totalUnrealizedROI: data.totalUnrealizedROI as number,
        unsettledPnL: data.unsettledPnL as number,
        perpUnsettledPnL: (data.perpUnsettledPnL as number) ?? 0,
        holding: Array.isArray(data.holding)
          ? (data.holding as API.Holding[])
          : [],
        usdcHolding:
          typeof data.usdcHolding === "number"
            ? data.usdcHolding
            : data.usdcHolding.toNumber(),
      });
    }
  }
}

export { PortfolioCalculator };
