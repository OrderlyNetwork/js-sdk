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

  private _lastSymbol: string = "";
  private _lastResolution: string = "";
  private _lastPath: string = "";

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
    ["1M", "1m"], // 1 month (mapped to 1m)
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
      if (this._lastPath === KLINE_HISTORY_PATH) {
        requestParams.limit = countBack;
      } else {
        requestParams.countback = countBack;
      }
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
    // Reset to HISTORY_PATH if symbol or resolution changes
    const isNewSymbol = this._lastSymbol !== symbolInfo.ticker;
    const isNewResolution = this._lastResolution !== resolution;
    if (isNewSymbol || isNewResolution) {
      this._lastPath = HISTORY_PATH;
    }

    const requestParams = this._buildRequestParams(
      symbolInfo,
      resolution,
      periodParams,
    );

    return new Promise(
      async (
        resolve: (result: GetBarsResult) => void,
        reject: (reason: string) => void,
      ) => {
        try {
          let result;

          const countBack = Math.min(periodParams.countBack ?? 0, 1000);

          // If current path is already KLINE_HISTORY_PATH, directly use KLINE_HISTORY_PATH request logic
          if (this._lastPath === KLINE_HISTORY_PATH) {
            result = await this._requestKlineHistory(requestParams);
          } else {
            // Use HISTORY_PATH request
            const initialResponse =
              await this._requester.sendRequest<HistoryResponse>(
                this._datafeedUrl,
                HISTORY_PATH,
                requestParams,
              );

            // Check if the returned data amount is sufficient
            const expectedCount = typeof countBack === "number" ? countBack : 0;
            const isDataSufficient = this._checkHistoryLength(
              initialResponse,
              expectedCount,
            );

            if (isDataSufficient) {
              // Data amount is sufficient, directly use the initial response
              result = this._processHistoryResponse(initialResponse);
            } else {
              // Data amount is insufficient, switch to KLINE_HISTORY_PATH and request again
              this._lastPath = KLINE_HISTORY_PATH;
              requestParams.limit = countBack;
              delete requestParams.countback;
              try {
                result = await this._requestKlineHistory(requestParams);
                if (result.bars.length === 0) {
                  throw new Error("No data");
                }
              } catch (e: unknown) {
                // if the kline history request fails, fallback to the initial response
                result = this._processHistoryResponse(initialResponse);
              }
            }
          }

          if (this._limitedServerResponse) {
            await this._processTruncatedResponse(result, requestParams);
          }

          // Save current symbol and resolution for next change detection
          this._lastSymbol = symbolInfo.ticker as string;
          this._lastResolution = resolution;
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
   * @param requestParams - Request parameters
   * @returns Processed history response
   */
  private async _requestKlineHistory(
    requestParams: RequestParams,
  ): Promise<GetBarsResult> {
    console.log("requestKlineHistory requestParams", requestParams);
    const klineResponse = await this._requester.sendRequest<HistoryResponse>(
      this._datafeedUrl,
      KLINE_HISTORY_PATH,
      {
        ...requestParams,
        resolution: this._mapToKlineHistoryResolution(
          requestParams.resolution as string,
        ),
      },
    );
    return this._processHistoryResponse(klineResponse);
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

  /**
   * if the length of the history data is less than the length, return false, otherwise return true
   * @param response - the response from the history api
   * @param length - the length of the history data
   * @returns
   */
  private _checkHistoryLength(
    response: HistoryResponse | UdfErrorResponse,
    length: number,
  ) {
    if (response.s !== "ok" && response.s !== "no_data") {
      throw new Error(response.errmsg);
    }
    if (response.s === "no_data") {
      return false;
    }
    return response.t.length >= length;
  }
}
