import { API } from "@orderly.network/types";
import { CalculatorCtx, CalculatorScope } from "../../types";
import { Portfolio, useAppStore } from "../appStore";
import { useMarketStore } from "../useMarket/market.store";

export class CalculatorContext implements CalculatorCtx {
  accountInfo: API.AccountInfo;
  symbolsInfo: Record<string, API.SymbolExt>;
  fundingRates: Record<string, API.FundingRate>;
  holding: API.Holding[];
  // portfolio
  portfolio: Portfolio;
  markPrices: Record<string, number> | null;
  // markets: Record<string, API.MarketInfoExt> | null;
  private output: Record<string, any>;

  constructor(scope: CalculatorScope, data: any) {
    this.accountInfo = useAppStore.getState().accountInfo as API.AccountInfo;
    this.symbolsInfo = useAppStore.getState().symbolsInfo as Record<
      string,
      API.SymbolExt
    >;
    this.fundingRates = useAppStore.getState().fundingRates as Record<
      string,
      API.FundingRate
    >;
    this.holding = useAppStore.getState().portfolio.holding as API.Holding[];

    this.portfolio = useAppStore.getState().portfolio as Portfolio;

    // console.log("!!!! CalculatorContext", this.holding);

    // const positions = usePositionStore.getState().positions;
    this.markPrices = scope === CalculatorScope.MARK_PRICE ? data : null;
    // this.markets = useMarketStore.getState().marketMap;

    this.output = {
      // rows: positions,
    };
  }

  get(fn: (output: Record<string, any>) => any) {
    return fn(this.output);
  }

  // get positions(): API.PositionTPSLExt[] {
  //   if (this.output.positionCalculator) return this.output.positionCalculator;
  //   return usePositionStore.getState().positions;
  // }

  get isReady(): boolean {
    // return !!this.accountInfo && !!this.symbolsInfo && !!this.fundingRates;
    return !!this.accountInfo;
  }

  saveOutput(name: string, data: any) {
    this.output[name] = data;
  }

  outputToValue() {
    return this.output;
  }
}
