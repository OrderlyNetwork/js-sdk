import { API } from "@orderly.network/types";
import { CalculatorCtx, CalculatorScope } from "../../types";
import { useAppStore } from "../appStore";

export class CalculatorContext implements CalculatorCtx {
  accountInfo: API.AccountInfo;
  symbolsInfo: Record<string, API.SymbolExt>;
  fundingRates: Record<string, API.FundingRate>;
  holding: API.Holding[];
  markPrices: Record<string, number> | null;
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

    // console.log("!!!! CalculatorContext", this.holding);

    // const positions = usePositionStore.getState().positions;
    this.markPrices = scope === CalculatorScope.MARK_PRICE ? data : null;

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
    return !!this.accountInfo && !!this.symbolsInfo && !!this.fundingRates;
  }

  saveOutput(name: string, data: any) {
    this.output[name] = data;
  }

  outputToValue() {
    return this.output;
  }
}
