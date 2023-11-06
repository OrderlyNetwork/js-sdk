import {
  IBasicDataFeed,
  LibrarySymbolInfo,
  OnReadyCallback,
  QuotesCallback,
  QuotesErrorCallback,
  ResolutionString,
  SubscribeBarsCallback,
} from "@/@types/charting_library";
import { defaultTimeInterval } from "./timeIntervalToolbar";
import { WS } from "@orderly.network/net";

// const OrderlyRe;

export default class DataFeed implements IBasicDataFeed {
  private _config?: any;

  private market?: Promise<any>;
  private marketResolver?: Function;
  private marketRejector?: Function;

  private onRealtimeCallback?: QuotesCallback;

  private handlerMap: Map<string, any> = new Map();
  private _lastBarsCache: Map<string, any> = new Map();

  constructor(
    private readonly configuration: {
      apiBaseUrl: string;
    },
    private readonly wsClient: WS
  ) {
    this.market = new Promise((resolve, reject) => {
      this.marketResolver = resolve;
      this.marketRejector = reject;
    });

    this.wsClient.on(".*@ticker", (message: any) => {
      const item = this.handlerMap.get(message.topic);

      if (item && typeof item.handler === "function") {
        const { data } = message;
        const lastBar = this._lastBarsCache.get(data.symbol) || {};

        // console.log(lastBar.high, lastBar.low, data.symbol, data.close);

        const newBar = {
          // FIXME
          // time: message.ts,
          // time: data.time,
          ...lastBar,
          close: data.close,
          // open: lastBar.open,
          // high: Math.max(lastBar.high, data.close),
          // low: Math.min(lastBar.low, data.close),
          // volume: data.volume,
        };

        item.handler(newBar);

        this.onRealtimeCallback?.([
          {
            s: "ok",
            n: data.symbol,
            v: {
              ch: data.close - lastBar.open,
              chp: ((data.close - lastBar.open) / lastBar.open) * 100,
              short_name: data.symbol,
            },
          },
        ]);

        this._lastBarsCache.set(data.symbol, newBar);
      }
    });
  }
  async onReady(callback: OnReadyCallback) {
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
  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {}

  resolveSymbol(
    symbolName,
    onSymbolResolvedCallback,
    onResolveErrorCallback,
    extension
  ) {
    //
    // fetch(`${this.configuration.apiBaseUrl}/tv/symbol_info?group=${symbolName}`)
    //   .then((res) => res.json())
    //   // .then((data) => data && data.s === "ok")
    //   .then((res) => {
    //

    setTimeout(() => {
      const cIndex = this._config["symbol"].indexOf(symbolName);
      //
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
    onResult,
    onErrorCallback
  ) {
    //
    let resolutionNum = resolution < 5 ? 1 : resolution;
    if (resolution > 60) {
      resolutionNum = `${resolution / 60}h`;
    }

    fetch(
      `${this.configuration.apiBaseUrl}/tv/history?symbol=${symbolInfo.full_name}&resolution=${resolutionNum}&from=${periodParams.from}&to=${periodParams.to}&countBack=${periodParams.countBack}`
    )
      .then((res) => res.json())
      .then((res) => {
        //
        if (res.s !== "ok") {
          onResult([], { noData: true });
          this.marketRejector?.();
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

        const lastBar = bars[bars.length - 1];
        this._lastBarsCache.set(symbolInfo.full_name, lastBar);
        this.marketResolver?.(lastBar);

        onResult(bars, { noData: false });
      });
  }
  subscribeBars(
    symbolInfo: any,
    resolution: string,
    onTick: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback
  ) {
    const channelString = `${symbolInfo.full_name}@ticker`;

    let subscriptionItem = this.handlerMap.get(channelString);

    if (subscriptionItem) {
      return;
    }

    // this.wsClient.send({
    //   id: "kline",
    //   event: "subscribe",
    //   topic: `${symbolInfo.full_name}@kline_${resolution}`,
    // });

    const _subscriber = this.wsClient.subscribe(
      `${symbolInfo.full_name}@kline_${resolution}`,
      {
        onMessage: (data: any) => {
          //

          // if (data.endTime < Date.now()) return;
          const lastBar = {
            time: data.startTime,
            // time: Date.now(),
            close: data.close,
            open: data.open,
            high: data.high,
            low: data.low,
            volume: data.volume,
          };
          onTick(lastBar);

          this._lastBarsCache.set(symbolInfo.full_name, lastBar);
        },
      }
    );

    subscriptionItem = {
      subscriberUID,
      topic: `${symbolInfo.full_name}@ticker`,
      symbol: symbolInfo.full_name,
      handler: onTick,
      unsubscribe: _subscriber,
    };

    this.handlerMap.set(channelString, subscriptionItem);
  }
  unsubscribeBars(subscriberUID: string) {
    const arr = subscriberUID.split("_#_");

    const channelString = `${arr[0]}@ticker`;

    const subscriptionItem = this.handlerMap.get(channelString);

    // console.log("unsubscribeBars", subscriptionItem);

    this._lastBarsCache.delete(channelString);

    if (subscriptionItem) {
      subscriptionItem.unsubscribe?.();
      this.handlerMap.delete(channelString);
    }

    // if (this._subscriber) {
    //   this._subscriber.unsubscribe();
    // }
  }

  getQuotes(
    symbols: string[],
    onDataCallback: QuotesCallback,
    onErrorCallback: QuotesErrorCallback
  ) {
    this.market?.then((data: any) => {
      const symbol = symbols[0];
      const cIndex = this._config["symbol"].indexOf(symbol);

      onDataCallback([
        {
          s: "ok",
          n: symbols[0],
          v: {
            ch: data.close - data.open,
            chp: ((data.close - data.open) / data.open) * 100,
            short_name: symbol,
            exchange: "",
            original_name: this._config["description"][cIndex],
            description: this._config["description"][cIndex],

            open_price: data.open,
            high_price: data.high,
            low_price: data.low,
            prev_close_price: data.close,
            volume: data.volume,
          },
        },
      ]);
    });
  }
  subscribeQuotes(
    symbols: string[],
    fastSymbols: string[],
    onRealtimeCallback: QuotesCallback,
    listenerGUID: string
  ) {
    this.onRealtimeCallback = onRealtimeCallback;
  }

  unsubscribeQuotes(subscriberUID: string): void {
    this.onRealtimeCallback = undefined;
  }

  private parseResolution(resolution: string): string {
    switch (resolution) {
      case "1":
        return "1m";
      case "5":
        return "5m";
      case "15":
        return "15m";
      case "30":
        return "30m";
      case "60":
        return "1h";
      case "240":
        return "4h";
      case "720":
        return "12h";
      case "1D":
        return "1d";
      case "1W":
      default:
        return "1w";
    }
  }
}
