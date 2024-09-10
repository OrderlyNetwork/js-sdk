import { API } from "@orderly.network/types";
import { CalculatorCtx } from "../../types";
import { useAppStore } from "../appStore";

export class CalculatorContext implements CalculatorCtx {
  accountInfo: API.AccountInfo;
  symbolsInfo: Record<string, API.SymbolExt>;
  fundingRates: Record<string, API.FundingRate>;
  private output: Record<string, any> = {};
  constructor() {
    this.accountInfo = useAppStore.getState().accountInfo as API.AccountInfo;
    this.symbolsInfo = useAppStore.getState().symbolsInfo as Record<
      string,
      API.SymbolExt
    >;
    this.fundingRates = useAppStore.getState().fundingRates as Record<
      string,
      API.FundingRate
    >;
  }

  get(output: Record<string, any>) {
    return output;
  }

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
