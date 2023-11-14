import { Account, SimpleDI } from "@orderly.network/core";
import { AsyncSubject, BehaviorSubject, combineLatest, merge } from "rxjs";
import { combineLatestWith, map, switchMap } from "rxjs/operators";
import { WebSocketClient } from "@orderly.network/net";
import { API, WSMessage } from "@orderly.network/types";
import { Cache } from "swr";
import { getAppState } from "./appState";

export interface DataSourceState {
  positions: any[];
  orders: any[];
}

export interface PublicDataSourceState {
  symbolInfo: any;
  fundingRates: any;
}

class SWRCacheProvider implements Cache<any> {
  private map = new Map();
  keys(): IterableIterator<string> {
    return this.map.keys();
  }
  get(key: string) {
    //
    return this.map.get(key);
  }
  set(key: string, value: any) {
    this.map.set(key, value);
  }
  delete(key: string) {
    this.map.delete(key);
  }
}

export class DataSource {
  static instanceName = "DataSource";
  appState = getAppState();
  swrCacheProvider = new SWRCacheProvider();
  publicDataSource$ = new BehaviorSubject<PublicDataSourceState>({
    symbolInfo: {},
    fundingRates: {},
  });
  private dataSource$: BehaviorSubject<DataSourceState> =
    new BehaviorSubject<DataSourceState>({
      positions: [],
      orders: [],
    });

  // accountInfo$ = new BehaviorSubject<API.AccountInfo>({});

  constructor(
    private readonly account: Account,
    private readonly ws: WebSocketClient
  ) {
    this.init();
  }

  get accountInfo$() {
    return this.account.state$
      .pipe
      // switchMap((state) => {
      //   // if (state === "signedIn") {
      //   //   return this.account.info$;
      //   // } else {
      //   //   return new AsyncSubject<API.AccountInfo>();
      //   // }
      // }),
      ();
  }

  get markPrices$() {
    return this.ws.observe<{ [key: string]: number }>("markprices").pipe(
      map<any, any>((data: WSMessage.MarkPrice[]) => {
        const prices: { [key: string]: number } = {};

        data.forEach((item) => {
          prices[item.symbol] = item.price;
        });
        return prices;
      })
    );
  }

  get positions$() {
    // 进行各种转换
    return this.dataSource$.pipe(map((state) => state.positions));
  }

  get orders$() {
    return this.dataSource$.asObservable().pipe(map((state) => state.orders));
  }

  get __positions$() {
    return;
  }

  init() {
    // public data
    // merge([]);
    // this.publicDataSource$
    // return merge().pipe(combineLatestWith(this.markPrices$)).subscribe();
  }

  fetch(url: string, init?: RequestInit) {}
}
