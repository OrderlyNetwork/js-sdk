import { LibrarySymbolInfo, QuoteData, QuotesCallback, ResolutionString, SubscribeBarsCallback } from '../type';
import { AbstractDatafeed } from './abstract-datafeed';
import { WebsocketService } from './websocket.service';

// We can't trust the listenerGuid provided by tradingview. It might be the same.
const getAutoIncrementId = (() => {
    let id = 0;
    return () => id++;
})();

export class Datafeed extends AbstractDatafeed {
    private _subscribeQuoteMap: Map<string, any>;

    private _prefixId: number;
    private _publicWs: WebsocketService;



    constructor(ws: any) {
        const datafeedURL = `https://testnet-api-evm.orderly.org/tv`;
        super(datafeedURL);

        this._subscribeQuoteMap = new Map();
        this._prefixId = getAutoIncrementId();
        this._publicWs = new WebsocketService(ws);
       // ws.on('')
    }

    public subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string) {
        this._publicWs.subscribeKline(`${this._prefixId}${listenerGuid}`, symbolInfo.ticker, resolution, onTick);
    }

    public unsubscribeBars(listenerGuid: string): void {
        this._publicWs.unsubscribeKline(`${this._prefixId}${listenerGuid}`);
    }

    public getQuotes(symbols: string[], onDataCallback: QuotesCallback): void {
        const subscriptionId = `${this._prefixId}getQuotes`;

        this.unsubscribeQuotes(subscriptionId);

    }

    public subscribeQuotes(symbols: string[], fastSymbols: string[], onRealtimeCallback: QuotesCallback, listenerGuid: string): void {
        const subscriptionId = `${this._prefixId}${listenerGuid}`;
        if (symbols.length > 0) {
            this.unsubscribeQuotes(subscriptionId);
        }
    }

    public unsubscribeQuotes(subscriptionId: string): void {
        const subscription = this._subscribeQuoteMap.get(subscriptionId);
        if (subscription) {
            subscription.unsubscribe();
        }
    }

    public remove() {
        Array.from(this._subscribeQuoteMap.values()).forEach((s) => s?.unsubscribe());
    }

    private _toUDFTicker(t: any): QuoteData {
        return {
            n: t.symbol,
            s: 'ok',
            v: {
                ask: t.firstAskPrice,
                bid: t.firstBidPrice,
                ch: t.change,
                chp: t.perChange / 100,
                description: '',
                exchange: 'WOO X',
                hight_price: t.high,
                low_price: t.low,
                lp: t.lastPrice,
                open_price: t.openPrice,
                prev_close_price: 0,
                volume: t.volume,
            },
        };
    }
}
