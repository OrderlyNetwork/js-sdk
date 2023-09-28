import {
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  ResolutionString,
} from "@/@types/charting_library";
import { defaultTimeInterval } from "./timeIntervalToolbar";
import { WS } from "@orderly.network/net";
import { ORDERLY_TRADING_VIEW_INTERVAL } from "./constants";

// const OrderlyRe;

export default class DataFeed implements IBasicDataFeed {
  private _config?: any;
  constructor(
    private readonly configuration: {
      apiBaseUrl: string;
    },
    private readonly wsClient: WS
  ) {}
  async onReady(callback: OnReadyCallback) {
    console.log("[onReady]: Method call");

    // fetch(`${this.configuration.apiBaseUrl}/tv/config`)

    fetch(`${this.configuration.apiBaseUrl}/tv/symbol_info?group=WOO%20X`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.s === "ok") {
          this._config = data;

          callback({});
        }
      });
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
    // fetch(`${this.configuration.apiBaseUrl}/tv/symbol_info?group=${symbolName}`)
    //   .then((res) => res.json())
    //   // .then((data) => data && data.s === "ok")
    //   .then((res) => {
    // console.log("==========>>>>>>>", res);

    setTimeout(() => {
      const cIndex = this._config["symbol"].indexOf(symbolName);
      console.log(cIndex, this._config);
      // const interval = localStorage.getItem(ORDERLY_TRADING_VIEW_INTERVAL)
      const symbolInfo: LibrarySymbolInfo = {
        // name: `${symbolArr[1]}/${symbolArr[2]}`,
        name: symbolName,
        full_name: symbolName,
        // description: symbolName,
        description: this._config["description"][cIndex],
        type: this._config["session-regular"][cIndex] || "crypto",
        session: this._config["session-regular"][cIndex] || "24x7",
        exchange: "",

        listed_exchange: "",
        pricescale: this._config["pricescale"][cIndex],
        minmov: this._config["minmovement"][cIndex] || 1,
        supported_resolutions: defaultTimeInterval.map(
          (item) => item.value
        ) as ResolutionString[],
        has_intraday: this._config["has-intraday"][cIndex],
        // intraday_multipliers: Resolutions,
        has_daily: this._config["has-daily"][cIndex],
        currency_code: this._config["currency"][cIndex],

        // has_weekly_and_monthly: true,
        // has_empty_bars: true,
        // has_no_volume: false,
        // visible_plots_set:
        // // volume_precision: Number(volumePrecision),
        // timezone: getTimeZoneCity() || 'Asia/Shanghai',
        // timezone: "Etc/UTC",
        timezone: this._config["timezone"][cIndex] || "Asia/Shanghai",
        format: "price",
      };

      onSymbolResolvedCallback(symbolInfo);
    }, 0);

    // });
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
    console.log(
      "[subscribeBars]: Method call with subscriberUID:",
      subscriberUID,
      symbolInfo,
      resolution
    );

    // this.wsClient.subscribe(`${symbolInfo.full_name}@kline_1`, {
    //   onMessage: (data: any) => {
    //     // console.log("******* kline ******", data);
    //     onRealtimeCallback({
    //       time: data.endTime,
    //       close: data.close,
    //       open: data.open,
    //       high: data.high,
    //       low: data.low,
    //       volume: data.volume,
    //     });
    //   },
    // });

    // subscribe trade
    // this.wsClient.subscribe(`${symbolInfo.full_name}@ticker`, {
    //   onMessage: (data: any) => {
    //     console.log("******* ticker ******", data);
    //     onRealtimeCallback({
    //       time: Date.now(),
    //       close: data.close,
    //       open: data.open,
    //       high: data.high,
    //       low: data.low,
    //       volume: data.volume,
    //     });
    //   },
    // });
  }
  unsubscribeBars(subscriberUID: string) {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );

    const arr = subscriberUID.split("_#_");

    this.wsClient.send({
      event: "unsubscribe",
      topic: `${arr[0]}@kline_${arr[2]}`,
    });

    // this.wsClient.send({ event: "unsubscribe", topic: `${arr[0]}@ticker` });

    // if (this._subscriber) {
    //   this._subscriber.unsubscribe();
    // }
  }
}
