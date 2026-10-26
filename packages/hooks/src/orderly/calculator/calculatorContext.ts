import { API } from "@orderly.network/types";
import { CalculatorCtx, CalculatorScope } from "../../types";
import { Portfolio, useAppStore } from "../appStore";
// import { useTokensInfoStore } from "../useTokensInfo/tokensInfo.store";
import { MarketCalculatorName } from "./markPrice";

export class CalculatorContext implements CalculatorCtx {
  accountInfo?: API.AccountInfo;
  symbolsInfo?: Record<string, API.SymbolExt>;
  perpSymbolsInfo?: Record<string, API.SymbolExt>;
  fundingRates?: Record<string, API.FundingRate>;
  // holding: API.Holding[];
  // portfolio — dynamic getter to always read the latest output from PortfolioCalculator
  get portfolio(): Portfolio | undefined {
    return (
      this.output["portfolio"] ||
      (useAppStore.getState().portfolio as Portfolio)
    );
  }
  markPrices?: Record<string, number> | null;
  // positions: API.PositionTPSLExt[];
  // markets: Record<string, API.MarketInfoExt> | null;
  tokensInfo?: API.Token[];

  private output: Record<string, any>;

  /**
   * Memoized symbolsInfo/accountInfo composition keyed by store input
   * references. setCtxData runs on every calculator update (each price tick
   * per scope); the inputs only change when their SWR payloads do, so the
   * composed ~800-key records are reused while the references are unchanged.
   */
  private lastCompose?: {
    symbolsInfoInput?: Record<string, API.SymbolExt>;
    binarySymbolsInfoInput?: Record<string, API.SymbolExt>;
    accountInfoInput?: API.AccountInfo;
    symbolsInfo: Record<string, API.SymbolExt>;
    accountInfo: API.AccountInfo | undefined;
  };

  private static _instance: CalculatorContext;

  static get instance() {
    return this._instance;
  }

  static create(scope: CalculatorScope, data: any) {
    if (!this._instance) {
      this._instance = new CalculatorContext(scope, data);
    }
    return this._instance.update(scope, data);
  }

  constructor(scope: CalculatorScope, data: any) {
    // this.accountInfo = useAppStore.getState().accountInfo as API.AccountInfo;
    // this.symbolsInfo = useAppStore.getState().symbolsInfo as Record<
    //   string,
    //   API.SymbolExt
    // >;
    this.setCtxData();

    // this.holding = useAppStore.getState().portfolio.holding as API.Holding[];

    // this.portfolio = useAppStore.getState().portfolio as Portfolio;

    // console.log("!!!! CalculatorContext", this.holding);

    // const positions = usePositionStore.getState().positions;
    // this.markPrices = scope === CalculatorScope.MARK_PRICE ? data : null;
    // this.markets = useMarketStore.getState().marketMap;

    // this.positions = usePositionStore.getState().positions[this.symbol];

    this.output = {
      // rows: positions,
    };
  }

  private update(scope: CalculatorScope, data: any) {
    this.setCtxData();
    this.markPrices =
      scope === CalculatorScope.MARK_PRICE
        ? data
        : this.output[MarketCalculatorName];
    return this;
  }

  private setCtxData() {
    const state = useAppStore.getState();
    this.perpSymbolsInfo = state.symbolsInfo;
    this.fundingRates = state.fundingRates as Record<string, API.FundingRate>;
    this.tokensInfo = state.tokensInfo || [];

    if (
      this.lastCompose &&
      this.lastCompose.symbolsInfoInput === state.symbolsInfo &&
      this.lastCompose.binarySymbolsInfoInput === state.binarySymbolsInfo &&
      this.lastCompose.accountInfoInput === state.accountInfo
    ) {
      this.symbolsInfo = this.lastCompose.symbolsInfo;
      this.accountInfo = this.lastCompose.accountInfo;
      return;
    }

    const accountInfo = state.accountInfo as API.AccountInfo;
    const binarySymbolsInfo = state.binarySymbolsInfo;
    let composedAccountInfo = accountInfo;
    let symbolsInfo: Record<string, API.SymbolExt>;

    if (binarySymbolsInfo) {
      // Compose the binary symbol config (from /v1/public/binary/info with the
      // PRD-fixed base_imr=1/base_mmr=0) into the calculator view only —
      // appStore.symbolsInfo itself stays binary-free for plain consumers
      // (symbol pickers, badge lookups, ...).
      symbolsInfo = {
        ...state.symbolsInfo,
        ...binarySymbolsInfo,
      } as Record<string, API.SymbolExt>;

      if (accountInfo) {
        // Binary rows must also resolve IMR_Factor (portfolio's
        // totalInitialMarginWithQty throws on a missing entry) even when
        // /v1/client/info's imr_factor map doesn't list the symbol.
        let missing = false;
        const imrFactor: Record<string, number> = {
          ...accountInfo.imr_factor,
        };
        for (const symbol of Object.keys(binarySymbolsInfo)) {
          if (imrFactor[symbol] == null) {
            imrFactor[symbol] = binarySymbolsInfo[symbol].imr_factor ?? 0;
            missing = true;
          }
        }
        if (missing) {
          composedAccountInfo = { ...accountInfo, imr_factor: imrFactor };
        }
      }
    } else {
      symbolsInfo = state.symbolsInfo as Record<string, API.SymbolExt>;
    }

    this.lastCompose = {
      symbolsInfoInput: state.symbolsInfo,
      binarySymbolsInfoInput: binarySymbolsInfo,
      accountInfoInput: accountInfo,
      symbolsInfo,
      accountInfo: composedAccountInfo,
    };
    this.symbolsInfo = symbolsInfo;
    this.accountInfo = composedAccountInfo;
  }

  get(fn: (output: Record<string, any>) => any) {
    return fn(this.output);
  }

  getCacheValue(name: string, fallback: () => any) {
    return this.output[name] || fallback();
  }

  clearCache() {
    this.output = {};
    this.accountInfo = undefined;
  }

  deleteByName(name: string) {
    delete this.output[name];
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
