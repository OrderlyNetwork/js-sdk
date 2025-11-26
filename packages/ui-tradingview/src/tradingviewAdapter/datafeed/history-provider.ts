import { Bar, HistoryMetadata, LibrarySymbolInfo, PeriodParams } from "../type";
import {
  RequestParams,
  UdfErrorResponse,
  UdfOkResponse,
  UdfResponse,
  getErrorMessage,
} from "./helpers";
import { IRequester } from "./iRequester";

// tslint:disable: no-any
interface HistoryPartialDataResponse extends UdfOkResponse {
  t: any;
  c: any;
  o?: never;
  h?: never;
  l?: never;
  v?: never;
}

interface HistoryFullDataResponse extends UdfOkResponse {
  t: any;
  c: any;
  o: any;
  h: any;
  l: any;
  v: any;
}

// tslint:enable: no-any
interface HistoryNoDataResponse extends UdfResponse {
  s: "no_data";
  nextTime?: number;
}

type HistoryResponse =
  | HistoryFullDataResponse
  | HistoryPartialDataResponse
  | HistoryNoDataResponse;

export type PeriodParamsWithOptionalCountback = Omit<
  PeriodParams,
  "countBack"
> & { countBack?: number };

export interface GetBarsResult {
  bars: Bar[];
  meta: HistoryMetadata;
}

const HISTORY_PATH = "tv/history";
const KLINE_HISTORY_PATH = "v1/tv/kline_history";

export interface LimitedResponseConfiguration {
  /**
   * Set this value to the maximum number of bars which
   * the data backend server can supply in a single response.
   * This doesn't affect or change the library behavior regarding
   * how many bars it will request. It just allows this Datafeed
   * implementation to correctly handle this situation.
   */
  maxResponseLength: number;
  /**
   * If the server can't return all the required bars in a single
   * response then `expectedOrder` specifies whether the server
   * will send the latest (newest) or earliest (older) data first.
   */
  expectedOrder: "latestFirst" | "earliestFirst";
}

export class HistoryProvider {
  private _datafeedUrl: string;
  private readonly _requester: IRequester;
  private readonly _limitedServerResponse?: LimitedResponseConfiguration;

  private readonly _klinePreference = new Map<string, boolean>();

  /**
   * Static mapping table for resolution conversion
   * Maps TradingView resolution format to Kline History API resolution format
   * Key: TradingView resolution, Value: Kline History API resolution
   */
  private static readonly _RESOLUTION_MAP = new Map<string, string>([
    ["1", "1m"], // 1 minute
    ["3", "3m"], // 3 minutes
    ["5", "5m"], // 5 minutes
    ["15", "15m"], // 15 minutes
    ["30", "30m"], // 30 minutes
    ["60", "1h"], // 1 hour
    ["240", "4h"], // 4 hours
    ["720", "12h"], // 12 hours
    ["1D", "1d"], // 1 day
    ["1W", "1w"], // 1 week
    ["1M", "1mon"], // 1 month (mapped to 1m)
  ]);

  public constructor(
    datafeedUrl: string,
    requester: IRequester,
    limitedServerResponse?: LimitedResponseConfiguration,
  ) {
    this._datafeedUrl = datafeedUrl;
    this._requester = requester;
    this._limitedServerResponse = limitedServerResponse;
  }

  /**
   * Build request parameters for history API calls
   * @param symbolInfo - Symbol information
   * @param resolution - Resolution string
   * @param periodParams - Period parameters with optional countback
   * @returns Request parameters object
   */
  private _buildRequestParams(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParamsWithOptionalCountback,
  ): RequestParams {
    const requestParams: RequestParams = {
      symbol: symbolInfo.ticker || "",
      resolution: resolution,
      from: periodParams.from,
      to: periodParams.to,
    };

    const countBack = Math.min(periodParams.countBack ?? 0, 1000);

    if (periodParams.countBack !== undefined) {
      requestParams.countback = countBack;
    }

    if (symbolInfo.currency_code !== undefined) {
      requestParams.currencyCode = symbolInfo.currency_code;
    }

    if (symbolInfo.unit_id !== undefined) {
      requestParams.unitId = symbolInfo.unit_id;
    }

    return requestParams;
  }

  public getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParamsWithOptionalCountback,
  ): Promise<GetBarsResult> {
    const requestParams = this._buildRequestParams(
      symbolInfo,
      resolution,
      periodParams,
    );

    const preferenceKey = this._getPreferenceKey(symbolInfo, resolution);
    const prefersKline = this._klinePreference.get(preferenceKey) === true;
    const countBack = Math.min(periodParams.countBack ?? 0, 1000);

    return new Promise(
      async (
        resolve: (result: GetBarsResult) => void,
        reject: (reason: string) => void,
      ) => {
        try {
          let result: GetBarsResult;
          let usedHistoryResult = false;

          if (prefersKline) {
            result = await this._requestKlineHistory(
              this._buildKlineParams(requestParams, countBack),
            );
          } else {
            const initialResponse = await this._requestHistory(requestParams);
            result = this._processHistoryResponse(initialResponse);
            usedHistoryResult = true;

            const needsFallback = this._shouldFallbackToKline(
              initialResponse,
              countBack,
            );

            if (needsFallback) {
              const klineResult = await this._tryKlineFallback(
                requestParams,
                countBack,
              );
              if (klineResult !== null) {
                result = klineResult;
                usedHistoryResult = false;
                this._klinePreference.set(preferenceKey, true);
              } else {
                this._klinePreference.set(preferenceKey, false);
              }
            } else {
              this._klinePreference.set(preferenceKey, false);
            }
          }

          if (usedHistoryResult && this._limitedServerResponse) {
            await this._processTruncatedResponse(result, { ...requestParams });
          }

          resolve(result);
        } catch (e: unknown) {
          const error =
            e instanceof Error ? e : typeof e === "string" ? e : undefined;
          const reasonString = getErrorMessage(error);
          // tslint:disable-next-line:no-console
          console.warn(
            `HistoryProvider: getBars() failed, error=${reasonString}`,
          );
          reject(reasonString || "Error");
        }
      },
    );
  }

  /**
   * Request kline history using KLINE_HISTORY_PATH endpoint
   * Handles rate limiting (429 errors) by waiting and retrying
   * @param requestParams - Request parameters
   * @param retryCount - Current retry attempt (internal use)
   * @returns Processed history response
   */
  private async _requestKlineHistory(
    requestParams: RequestParams,
    retryCount: number = 0,
  ): Promise<GetBarsResult> {
    const maxRetries = 5;
    const baseRetryDelay = 2500; // 2.5 seconds base delay (slightly more than 2s to avoid hitting limit)
    const maxRetryDelay = 10000; // Maximum 10 seconds delay

    // Build URL with query parameters
    const params: RequestParams = {
      ...requestParams,
      resolution: this._mapToKlineHistoryResolution(
        requestParams.resolution as string,
      ),
    };
    const urlPath = this._buildUrlWithParams(KLINE_HISTORY_PATH, params);

    // Make request with fetch to check HTTP status code
    const options: RequestInit = { credentials: "same-origin" };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requesterWithHeaders = this._requester as any;
    if (requesterWithHeaders._headers !== undefined) {
      options.headers = requesterWithHeaders._headers;
    }

    let response: Response;
    try {
      response = await fetch(`${this._datafeedUrl}/${urlPath}`, options);
    } catch (error) {
      // Network error, don't retry for rate limiting
      throw error;
    }

    // Check if we hit rate limit (429) - handle this BEFORE any JSON parsing
    if (response.status === 429) {
      if (retryCount >= maxRetries) {
        throw new Error(
          `Rate limit exceeded: Maximum retry attempts (${maxRetries}) reached`,
        );
      }

      // Calculate retry delay with exponential backoff
      const retryDelay = Math.min(
        baseRetryDelay * Math.pow(2, retryCount),
        maxRetryDelay,
      );

      // Check if response has Retry-After header
      const retryAfter = response.headers.get("Retry-After");
      const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : retryDelay;

      // IMPORTANT: Wait BEFORE retrying to avoid hitting rate limit again
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Retry the request after waiting
      return this._requestKlineHistory(requestParams, retryCount + 1);
    }

    // Check if response is not OK (but not 429, which we already handled)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(
        errorData.message || errorData.errmsg || response.statusText,
      );
    }

    // Parse response JSON
    let data: HistoryResponse | UdfErrorResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error("Failed to parse response JSON");
    }

    // Process the response (this will handle errors if response.s === "error")
    return this._processHistoryResponse(data);
  }

  /**
   * Process truncated response by making follow-up requests if needed
   * @param result - Current result with bars
   * @param requestParams - Request parameters
   */
  private async _processTruncatedResponse(
    result: GetBarsResult,
    requestParams: RequestParams,
  ) {
    let lastResultLength = result.bars.length;
    try {
      while (
        this._limitedServerResponse &&
        this._limitedServerResponse.maxResponseLength > 0 &&
        this._limitedServerResponse.maxResponseLength === lastResultLength &&
        requestParams.from < requestParams.to
      ) {
        // adjust request parameters for follow-up request
        if (requestParams.countback) {
          requestParams.countback =
            (requestParams.countback as number) - lastResultLength;
        }
        if (this._limitedServerResponse.expectedOrder === "earliestFirst") {
          requestParams.from = Math.round(
            result.bars[result.bars.length - 1].time / 1000,
          );
        } else {
          requestParams.to = Math.round(result.bars[0].time / 1000);
        }

        const followupResponse =
          await this._requester.sendRequest<HistoryResponse>(
            this._datafeedUrl,
            HISTORY_PATH,
            requestParams,
          );
        const followupResult = this._processHistoryResponse(followupResponse);
        lastResultLength = followupResult.bars.length;
        // merge result with results collected so far
        if (this._limitedServerResponse.expectedOrder === "earliestFirst") {
          if (
            followupResult.bars[0].time ===
            result.bars[result.bars.length - 1].time
          ) {
            // Datafeed shouldn't include a value exactly matching the `to` timestamp but in case it does
            // we will remove the duplicate.
            followupResult.bars.shift();
          }
          result.bars.push(...followupResult.bars);
        } else {
          if (
            followupResult.bars[followupResult.bars.length - 1].time ===
            result.bars[0].time
          ) {
            // Datafeed shouldn't include a value exactly matching the `to` timestamp but in case it does
            // we will remove the duplicate.
            followupResult.bars.pop();
          }
          result.bars.unshift(...followupResult.bars);
        }
      }
    } catch (e: unknown) {
      /**
       * Error occurred during followup request. We won't reject the original promise
       * because the initial response was valid so we will return what we've got so far.
       */
      if (e instanceof Error || typeof e === "string") {
        const reasonString = getErrorMessage(e);
        // tslint:disable-next-line:no-console
        console.warn(
          `HistoryProvider: getBars() warning during followup request, error=${reasonString}`,
        );
      }
    }
  }

  private _processHistoryResponse(
    response: HistoryResponse | UdfErrorResponse,
  ) {
    if (response.s !== "ok" && response.s !== "no_data") {
      throw new Error(response.errmsg);
    }

    const bars: Bar[] = [];
    const meta: HistoryMetadata = {
      noData: false,
    };

    if (response.s === "no_data") {
      meta.noData = true;
      meta.nextTime = response.nextTime;
    } else {
      const volumePresent = response.v !== undefined;
      const ohlPresent = response.o !== undefined;

      for (let i = 0; i < response.t.length; ++i) {
        const barValue: Bar = {
          time: response.t[i] * 1000,
          close: parseFloat(response.c[i]),
          open: parseFloat(response.c[i]),
          high: parseFloat(response.c[i]),
          low: parseFloat(response.c[i]),
        };

        if (ohlPresent) {
          barValue.open = parseFloat(
            (response as HistoryFullDataResponse).o[i],
          );
          barValue.high = parseFloat(
            (response as HistoryFullDataResponse).h[i],
          );
          barValue.low = parseFloat((response as HistoryFullDataResponse).l[i]);
        }

        if (volumePresent) {
          barValue.volume = parseFloat(
            (response as HistoryFullDataResponse).v[i],
          );
        }

        bars.push(barValue);
      }

      // const firstBarTime = response.t[0] * 1000;

      // meta.nextTime = firstBarTime;
    }

    return {
      bars: bars,
      meta: meta,
    };
  }

  /**
   * Maps TradingView resolution format to Kline History API resolution format
   * @param resolution - TradingView resolution string (e.g., "1", "60", "1D")
   * @returns Kline History API resolution string (e.g., "1m", "1h", "1d")
   */
  private _mapToKlineHistoryResolution(resolution: string): string {
    return HistoryProvider._RESOLUTION_MAP.get(resolution) ?? resolution;
  }

  private _buildUrlWithParams(path: string, params?: RequestParams): string {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }

    const searchParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${path}?${queryString}` : path;
  }

  private _getPreferenceKey(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
  ): string {
    return `${symbolInfo.ticker ?? ""}|${resolution}`;
  }

  private _requestHistory(requestParams: RequestParams) {
    return this._requester.sendRequest<HistoryResponse>(
      this._datafeedUrl,
      HISTORY_PATH,
      requestParams,
    );
  }

  private _buildKlineParams(
    requestParams: RequestParams,
    countBack: number,
  ): RequestParams {
    const params: RequestParams = {
      ...requestParams,
    };

    delete params.countback;
    if (countBack > 0) {
      params.limit = countBack;
    } else {
      delete params.limit;
    }

    return params;
  }

  private async _tryKlineFallback(
    requestParams: RequestParams,
    countBack: number,
  ): Promise<GetBarsResult | null> {
    try {
      const result = await this._requestKlineHistory(
        this._buildKlineParams(requestParams, countBack),
      );
      return result.bars.length > 0 ? result : null;
    } catch {
      return null;
    }
  }

  private _shouldFallbackToKline(
    response: HistoryResponse | UdfErrorResponse,
    expectedCount: number,
  ): boolean {
    if (response.s !== "ok") {
      return false;
    }

    const barsCount = response.t.length;
    if (expectedCount > 0 && barsCount < expectedCount) {
      return true;
    }

    if (
      this._limitedServerResponse &&
      this._limitedServerResponse.maxResponseLength > 0 &&
      barsCount >= this._limitedServerResponse.maxResponseLength
    ) {
      return true;
    }

    return false;
  }
}
