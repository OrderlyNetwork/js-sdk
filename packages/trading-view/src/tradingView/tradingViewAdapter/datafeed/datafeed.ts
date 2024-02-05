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

    private market?: Promise<any>;
    private marketResolver?: Function;
    private marketRejector?: Function;

    constructor(apiUrl: string, ws: any) {
        const datafeedURL = `${apiUrl}/tv`;
        super(datafeedURL);

        this._subscribeQuoteMap = new Map();
        this._prefixId = getAutoIncrementId();
        this._publicWs = new WebsocketService(ws);
        this.market = new Promise((resolve, reject) => {
            this.marketResolver = resolve;
            this.marketRejector = reject;
        });

        ws.on('.*@ticker', (message: any) => {
            // console.log('-- ticker message', message);
            this.marketResolver?.(message.data);
        })

       // ws.on('')
    }

    public subscribeBars(symbolInfo: LibrarySymbolInfo, resolution: ResolutionString, onTick: SubscribeBarsCallback, listenerGuid: string) {
        this._publicWs.subscribeKline(`${this._prefixId}${listenerGuid}`, symbolInfo.ticker, resolution, onTick);
    }

    public unsubscribeBars(listenerGuid: string): void {
        this._publicWs.unsubscribeKline(`${this._prefixId}${listenerGuid}`);
    }

    public getQuotes(symbols: string[], onDataCallback: QuotesCallback): void {
        this.market?.then((data: any) => {
            const symbol = symbols[0];
            onDataCallback([
                {
                    s: "ok",
                    n: symbols[0],
                    v: {
                        ch: data.close - data.open,
                        chp: ((data.close - data.open) / data.open) * 100,
                        short_name: symbol,
                        exchange: "",
                        description: '',

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
                exchange: 'Orderly',
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
