import {
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
} from "@/@types/charting_library";
import { defaultTimeInterval } from "./timeIntervalToolbar";
import { WebSocketClient } from "@orderly.network/net";

// const OrderlyRe;

export default class DataFeed implements IBasicDataFeed {
  private wsClient: WebSocketClient;
  private _subscriber?: any;
  constructor(
    private readonly configuration: {
      apiBaseUrl: string;
    }
  ) {
    this.wsClient = new WebSocketClient({
      accountId: "OqdphuyCtYWxwzhxyLLjOWNdFP7sQt8RPWzmb5xY",
    });
  }
  async onReady(callback: OnReadyCallback) {
    console.log("[onReady]: Method call");

    callback({});
  }
  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    console.log("[searchSymbols]: Method call");
  }
  resolveSymbol(
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback,
    extension
  ) {
    // console.log("[resolveSymbol]: Method call", symbolName);
    fetch(`${this.configuration.apiBaseUrl}/tv/symbol_info?group=${symbolName}`)
      .then((res) => res.json())
      .then((data) => data && data.s === "ok")
      .then((res) => {
        console.log(res);
        const symbolArr = symbolName.split("_");
        const symbolInfo: LibrarySymbolInfo = {
          // name: `${symbolArr[1]}/${symbolArr[2]}`,
          name: symbolName,
          full_name: symbolName,
          // description: symbolName,
          description: `${symbolArr[1]}/${symbolArr[2]}`,
          type: "crypto",
          session: "24x7",
          exchange: "",
          listed_exchange: "",
          pricescale: 100,
          minmov: 1,
          supported_resolutions: defaultTimeInterval.map(
            (item) => item.value
          ) as ResolutionString[],
          has_intraday: true,
          // intraday_multipliers: Resolutions,
          has_daily: true,
          currency_code: "USDC",

          // has_weekly_and_monthly: true,
          // has_empty_bars: true,
          // has_no_volume: false,
          // visible_plots_set:
          // // volume_precision: Number(volumePrecision),
          // timezone: getTimeZoneCity() || 'Asia/Shanghai',
          // timezone: "Etc/UTC",
          timezone: "Asia/Shanghai",
          format: "price",
        };

        onSymbolResolvedCallback(symbolInfo);
      });
  }
  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) {
    // console.log("[getBars]: Method call", symbolInfo);
    let resolutionNum = resolution < 5 ? 1 : resolution;
    if (resolution > 60) {
      resolutionNum = `${resolution / 60}h`;
    }
    fetch(
      `${this.configuration.apiBaseUrl}/tv/history?symbol=${symbolInfo.full_name}&resolution=${resolutionNum}&from=${periodParams.from}&to=${periodParams.to}&countBack=${periodParams.countBack}`
    )
      .then((res) => res.json())
      .then((res) => {
        // console.log(res);
        if (res.s !== "ok") {
          onHistoryCallback([], { noData: true });
          return;
        }
        const bars = res.t.map((t: number, index: number) => {
          return {
            open: res.o[index],
            high: res.h[index],
            low: res.l[index],
            close: res.c[index],
            time: t * 1000,
            volume: res.v[index],
          };
        });
        onHistoryCallback(bars, { noData: false });
      });
  }
  subscribeBars(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) {
    // console.log(
    //   "[subscribeBars]: Method call with subscriberUID:",
    //   subscriberUID,
    //   symbolInfo,
    //   resolution
    // );

    this._subscriber = this.wsClient
      .observe<any>(`${symbolInfo.full_name}@kline_1m`)
      .subscribe((data) => {
        console.log(data);
      });
  }
  unsubscribeBars(subscriberUID) {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );

    if (this._subscriber) {
      this._subscriber.unsubscribe();
    }
  }
}
