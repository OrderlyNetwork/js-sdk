import {
  LibrarySymbolInfo,
  QuoteData,
  QuotesCallback,
  ResolutionString,
  SubscribeBarsCallback,
} from "../type";
import { EXCHANGE, withExchangePrefix, withoutExchangePrefix } from "../../utils/chart.util";
import { AbstractDatafeed } from "./abstract-datafeed";
import { MultiBroadcastEventBus } from "./eventBus";
import { WebsocketService } from "./websocket.service";

const getAutoIncrementId = (() => {
  let id = 0;
  return () => id++;
})();

export class Datafeed extends AbstractDatafeed {
  private _subscribeQuoteMap: Map<string, any>;

  private _prefixId: number;
  private _publicWs: WebsocketService;

  private bbosMap: Map<string, any> = new Map();
  private tickersMap: Map<string, any> = new Map();
  private eventBus: MultiBroadcastEventBus = new MultiBroadcastEventBus();

  constructor(apiUrl: string, ws: any) {
    const datafeedURL = `${apiUrl}/tv`;
    super(datafeedURL);

    this._subscribeQuoteMap = new Map();
    this._prefixId = getAutoIncrementId();
    this._publicWs = new WebsocketService(ws);

    this.bbosMap = new Map();

    ws.on("tickers", (message: any) => {
      for (const ticker of message.data) {
        ticker.change = ticker.close - ticker.open;
        ticker.perChange = ticker.open
          ? +((100 * ticker.change) / ticker.open).toFixed(2)
          : 0;
        this.tickersMap!.set(ticker.symbol, ticker);
      }
      this.eventBus.publish("tickerUpdate", { message: "ticker" });
    });

    ws.subscribe(
      {
        event: "subscribe",
        topic: `bbos`,
      },
      {
        formatter: (message: any) => message,
        onMessage: (message: any) => {
          for (const bbo of message.data) {
            this.bbosMap!.set(bbo.symbol, {
              ask: bbo.ask,
              bid: bbo.bid,
              askSize: bbo.askSize,
              bidSize: bbo.bidSize,
            });
          }
          this.eventBus.publish("tickerUpdate", { message: "bbos" });
        },
      }
    );
  }

  public remove() {
    Array.from(this._subscribeQuoteMap.values()).forEach((s) => s?.());
  }

  private getSubscriptionId(listenerGuid: string) {
    return `${this._prefixId}${listenerGuid}`;
  }

  public subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string
  ) {
    this._publicWs.subscribeKline(
      `${this._prefixId}${listenerGuid}`,
      symbolInfo.ticker,
      resolution,
      onTick
    );
  }

  public unsubscribeBars(listenerGuid: string): void {
    this._publicWs.unsubscribeKline(`${this._prefixId}${listenerGuid}`);
  }

  public getQuotes(symbols: string[], onDataCallback: QuotesCallback): void {
    const subscriptionId = this.getSubscriptionId("getQuotes");

    this.unsubscribeQuotes("getQuotes");

    const unsub = this.eventBus.subscribe("tickerUpdate", (msg: any) => {
      const dataMap = new Map();

      symbols.forEach((symbol) => {
        const bbo = this.bbosMap.get(withoutExchangePrefix(symbol));
        const ticker = this.tickersMap.get(withoutExchangePrefix(symbol));
        if (!bbo || !ticker) {
          return;
        }
        const data = {
          ...ticker,
          ask: bbo.ask,
          bid: bbo.bid,
        };
        dataMap.set(withoutExchangePrefix(symbol), data);
      });

      if (!dataMap.size) {
        return;
      }
      onDataCallback(
        Array.from(dataMap.values()).map((symbolData: any) =>
          this._toUDFTicker(symbolData)
        )
      );
    });
    this._subscribeQuoteMap.set(subscriptionId, unsub);
  }

  public subscribeQuotes(
    symbols: string[],
    fastSymbols: string[],
    onRealtimeCallback: QuotesCallback,
    listenerGuid: string
  ): void {
    const subscriptionId = `${this._prefixId}${listenerGuid}`;
    if (symbols.length > 0) {
      this.unsubscribeQuotes(subscriptionId);

      const unsub = this.eventBus.subscribe("tickerUpdate", (msg: any) => {
        const dataMap = new Map();
        symbols.forEach((symbol) => {
          const bbo = this.bbosMap.get(withoutExchangePrefix(symbol));
          const ticker = this.tickersMap.get(withoutExchangePrefix(symbol));
          if (!bbo || !ticker) {
            return;
          }
          const data = {
            ...ticker,
            ask: bbo.ask,
            bid: bbo.bid,
          };
          dataMap.set(withoutExchangePrefix(symbol), data);
        });
        if (!dataMap.size) {
          return;
        }
        onRealtimeCallback(
          Array.from(dataMap.values()).map((symbolData: any) =>
            this._toUDFTicker(symbolData)
          )
        );
      });
      this._subscribeQuoteMap.set(subscriptionId, unsub);
    }
  }

  public unsubscribeQuotes(listenerGuid: string): void {
    const subscriptionId = this.getSubscriptionId(listenerGuid);

    const unsub = this._subscribeQuoteMap.get(subscriptionId);
    if (unsub) {
      unsub();
      this._subscribeQuoteMap.delete(subscriptionId);
    }
  }

  private _toUDFTicker(t: any): QuoteData {
    return {
      n: withExchangePrefix(t.symbol),
      s: "ok",
      v: {
        ask: t.ask,
        bid: t.bid,
        ch: t.change,
        chp: t.perChange / 100,
        description: "",
        exchange: EXCHANGE,
        hight_price: t.high,
        low_price: t.low,
        lp: t.close,
        open_price: t.open,
        prev_close_price: 0,
        volume: t.volume,
      },
    };
  }
}
