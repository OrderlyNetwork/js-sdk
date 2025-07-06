import { StateCreator } from "zustand";
import { API } from "@orderly.network/types";
import { Portfolio } from "./orderly/appStore";

// export type ImmerStateCreator<T> = StateCreator<CommonState, [["zustand/immer", never], never], [], T>;

export interface CalculatorCtx {
  //  positions:
  accountInfo?: API.AccountInfo;
  symbolsInfo?: Record<string, API.SymbolExt>;
  fundingRates?: Record<string, API.FundingRate>;
  // markPrices: Record<string, number> | null;
  // holding: API.Holding[];
  // positions: API.PositionTPSLExt[];
  // markets: Record<string, API.MarketInfoExt> | null;
  portfolio?: Portfolio;
  tokensInfo?: API.Chain[];

  get: <T extends any>(fn: (output: Record<string, any>) => T) => T;
  outputToValue: () => any;

  get isReady(): boolean;

  // onComplete: (name: string, data: any) => void;
  saveOutput: (name: string, data: any) => void;

  // get positions(): API.PositionTPSLExt[];

  // onQueueComplete: () => void;

  clearCache: () => void;
}

export enum CalculatorScope {
  MARK_PRICE = "markPrice",
  INDEX_PRICE = "indexPrice",
  POSITION = "position",
  ORDER = "order",
  TICK_PRICE = "tickPrice",
  ORDER_BOOK = "orderBook",
  PORTFOLIO = "portfolio",
  MARKET = "market",
}

export interface Calculator<T = any> {
  name: string;
  calc: (scope: CalculatorScope, data: any, ctx: CalculatorCtx) => T | null;
  cache: (result: T) => void;
  update: (data: T, scope: CalculatorScope) => void;

  destroy?: () => void;
}

export interface CalculatorScheduler {
  calc: (
    scope: CalculatorScope,
    calculators: Calculator[],
    data: any,
    ctx: CalculatorCtx,
  ) => Promise<any>;
  update: (scope: CalculatorScope, calculators: Calculator[], data: any) => any;
}
