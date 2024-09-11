import { API } from "@orderly.network/types";
import { StateCreator } from "zustand";

// export type ImmerStateCreator<T> = StateCreator<CommonState, [["zustand/immer", never], never], [], T>;

export interface CalculatorCtx {
  //  positions:
  accountInfo: API.AccountInfo;
  symbolsInfo: Record<string, API.SymbolExt>;
  fundingRates: Record<string, API.FundingRate>;
  get: (output: Record<string, any>) => any;
  outputToValue: () => any;
  get isReady(): boolean;

  // onComplete: (name: string, data: any) => void;
  saveOutput: (name: string, data: any) => void;

  get positions(): API.PositionTPSLExt[];

  // onQueueComplete: () => void;
}

export enum CalculatorScope {
  MARK_PRICE = "markPrice",
  POSITION = "position",
}

export interface Calculator<T = any> {
  name: string;
  calc: (scope: CalculatorScope, data: any, ctx: CalculatorCtx) => T;
  cache: (result: T) => void;
  update: (data: T) => void;
}

export interface CalculatorScheduler {
  calc: (
    scope: CalculatorScope,
    calculators: Calculator[],
    data: any,
    ctx: CalculatorCtx
  ) => Promise<any>;
  update: (scope: CalculatorScope, calculators: Calculator[], data: any) => any;
  // run: (calculators: Calculator[]) => void;
}
