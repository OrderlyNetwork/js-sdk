import {
  DatafeedConfiguration,
  ErrorCallback,
  HistoryCallback,
  LibrarySymbolInfo,
  OnReadyCallback,
  QuotesCallback,
  ResolutionString,
  ResolveCallback,
  SearchSymbolResultItem,
  SearchSymbolsCallback,
  SubscribeBarsCallback,
  SymbolResolveExtension,
} from "../type";
import { RequestParams, getErrorMessage, logMessage } from "./helpers";
import {
  GetBarsResult,
  HistoryProvider,
  PeriodParamsWithOptionalCountback,
} from "./history-provider";
import { Requester } from "./requester";
import { SymbolsStorage } from "./symbol-storage";

export interface UdfCompatibleConfiguration extends DatafeedConfiguration {
  // tslint:disable:tv-variable-name
  supports_search?: boolean;
  supports_group_request?: boolean;
  // tslint:enable:tv-variable-name
}

export interface ResolveSymbolResponse extends LibrarySymbolInfo {
  s: undefined;
}

// it is hack to let's TypeScript make code flow analysis
export interface UdfSearchSymbolsResponse
  extends Array<SearchSymbolResultItem> {
  s?: undefined;
}

export const enum Constants {
  SearchItemsLimit = 30,
}

export abstract class AbstractDatafeed {
  protected _configuration: UdfCompatibleConfiguration = defaultConfiguration();

  private readonly _datafeedURL: string;

  private readonly _configurationReadyPromise: Promise<void>;

  private _symbolsStorage: SymbolsStorage | null = null;

  private readonly _historyProvider: HistoryProvider;

  private readonly _requester: Requester;

  constructor(datafeedURL: string) {
    this._datafeedURL = datafeedURL;
    this._requester = new Requester();
    this._historyProvider = new HistoryProvider(datafeedURL, this._requester);

    this._configurationReadyPromise = this._requestConfiguration().then(
      (configuration: UdfCompatibleConfiguration | null) => {
        if (configuration === null) {
          configuration = defaultConfiguration();
        }

        this._setupWithConfiguration(configuration);
      }
    );
  }

  public getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParamsWithOptionalCountback,
    onResult: HistoryCallback,
    onError: ErrorCallback
  ): void {
    this._historyProvider
      .getBars(symbolInfo, resolution, periodParams)
      .then((result: GetBarsResult) => {
        onResult(result.bars, result.meta);
      })
      .catch(onError);
  }

  // @ts-ignore
  public abstract subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  );

  public onReady(callback: OnReadyCallback): void {
    this._configurationReadyPromise.then(() => {
      callback(this._configuration);
    });
  }

  public searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResult: SearchSymbolsCallback
  ): void {
    if (this._symbolsStorage === null) {
      throw new Error("Datafeed: inconsistent configuration (symbols storage)");
    }

    this._symbolsStorage
      .searchSymbols(
        userInput,
        exchange,
        symbolType,
        Constants.SearchItemsLimit
      )
      .then(onResult)
      .catch(onResult.bind(null, []));
  }

  public resolveSymbol(
    symbolName: string,
    onResolve: ResolveCallback,
    onError: ErrorCallback,
    extension?: SymbolResolveExtension
  ): void {
    const currencyCode = extension && extension.currencyCode;
    const unitId = extension && extension.unitId;

    const resolveRequestStartTime = Date.now();

    function onResultReady(symbolInfo: LibrarySymbolInfo): void {
      logMessage(`Symbol resolved: ${Date.now() - resolveRequestStartTime}ms`);
      onResolve(symbolInfo);
    }

    if (this._symbolsStorage === null) {
      throw new Error("Datafeed: inconsistent configuration (symbols storage)");
    }

    this._symbolsStorage
      .resolveSymbol(symbolName, currencyCode, unitId)
      .then(onResultReady)
      .catch(onError);
  }

  public abstract unsubscribeBars(listenerGuid: string): void;

  public getMarks(): void {
    /* not supported */
  }

  public getTimescaleMarks(): void {
    /* not supported */
  }

  public getServerTime(): void {
    /* not supported */
  }

  public abstract getQuotes(
    symbols: string[],
    onDataCallback: QuotesCallback,
    onErrorCallback: (msg: string) => void
  ): void;

  public abstract subscribeQuotes(
    symbols: string[],
    fastSymbols: string[],
    onRealtimeCallback: QuotesCallback,
    listenerGuid: string
  ): void;

  public abstract unsubscribeQuotes(listenerGuid: string): void;

  public abstract remove(): void;

  protected _requestConfiguration(): Promise<UdfCompatibleConfiguration | null> {
    return this._send<UdfCompatibleConfiguration>("config").catch(
      (reason?: string | Error) => {
        logMessage(
          `Datafeed: Cannot get datafeed configuration - use default, error=${getErrorMessage(
            reason
          )}`
        );
        return null;
      }
    );
  }

  private _send<T>(urlPath: string, params?: RequestParams): Promise<T> {
    return this._requester.sendRequest<T>(this._datafeedURL, urlPath, params);
  }

  private _setupWithConfiguration(
    configurationData: UdfCompatibleConfiguration
  ): void {
    this._configuration = configurationData;

    if (configurationData.exchanges === undefined) {
      configurationData.exchanges = [];
    }

    if (
      !configurationData.supports_search &&
      !configurationData.supports_group_request
    ) {
      throw new Error(
        "Unsupported datafeed configuration. Must either support search, or support group request"
      );
    }

    if (
      configurationData.supports_group_request ||
      !configurationData.supports_search
    ) {
      this._symbolsStorage = new SymbolsStorage(
        this._datafeedURL,
        configurationData.supported_resolutions || [],
        this._requester
      );
    }

    logMessage(
      `Datafeed: Initialized with ${JSON.stringify(configurationData)}`
    );
  }
}

function defaultConfiguration(): UdfCompatibleConfiguration {
  return {
    supports_search: false,
    supports_group_request: true,
    supported_resolutions: [
      "1" as ResolutionString,
      "3" as ResolutionString,
      "5" as ResolutionString,
      "15" as ResolutionString,
      "30" as ResolutionString,
      "60" as ResolutionString,
      "120" as ResolutionString,
      "240" as ResolutionString,
      "480" as ResolutionString,
      "720" as ResolutionString,
      "1D" as ResolutionString,
      "3D" as ResolutionString,
      "1W" as ResolutionString,
      "1M" as ResolutionString,
    ],
    supports_marks: false,
    supports_timescale_marks: false,
  };
}
