import { type API } from "@orderly.network/types";
// import { createGetter } from "../utils/createGetter";
import { getPrecisionByNumber } from "@orderly.network/utils";
import { useQuery } from "../useQuery";
import { useAppStore } from "./appStore";
import { useMarketStore } from "./useMarket/market.store";

const publicQueryOptions = {
  focusThrottleInterval: 1000 * 60 * 60 * 24,
  revalidateOnFocus: false,
  dedupingInterval: 1000 * 60 * 60 * 24,
};

export const usePublicDataObserver = () => {
  const { setSymbolsInfo, setFundingRates } = useAppStore(
    (state) => state.actions,
  );

  const { updateMarket } = useMarketStore((state) => state.actions);

  /**
   * symbol config
   */
  useQuery<Record<string, API.SymbolExt>>(`/v1/public/info`, {
    ...publicQueryOptions,
    onSuccess(data: API.Symbol[]) {
      if (!data || !data?.length) {
        return {};
      }
      const obj: Record<string, API.SymbolExt> = {};

      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        const arr = item.symbol.split("_");
        const base_dp = getPrecisionByNumber(item.base_tick);
        const quote_dp = getPrecisionByNumber(item.quote_tick);
        obj[item.symbol] = {
          ...item,
          base_dp,
          quote_dp,
          base: arr[1],
          quote: arr[2],
          type: arr[0],
          name: `${arr[1]}-${arr[0]}`,
        };
      }
      setSymbolsInfo(obj);
    },
  });

  /**
   * funding rates
   */
  useQuery<{ [key: string]: API.FundingRate }>(`/v1/public/funding_rates`, {
    ...publicQueryOptions,
    onSuccess(data: API.FundingRate[]) {
      if (!data || !data?.length) {
        return {};
      }
      const obj = Object.create(null);

      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        obj[item.symbol] = {
          ...item,
          est_funding_rate: getEstFundingRate(item),
        };
      }

      // return obj;
      setFundingRates(obj);
    },
  });

  /**
   * markets info
   */
  useQuery<API.MarketInfo[]>(`/v1/public/futures`, {
    // revalidateOnFocus: false,
    ...publicQueryOptions,
    onSuccess(data: API.MarketInfo[]) {
      if (!data || !data?.length) {
        return [];
      }
      // console.log(data);
      updateMarket(data as API.MarketInfoExt[]);
    },
  });
};

function getEstFundingRate(data: API.FundingRate) {
  if (!data) return;

  const { next_funding_time, est_funding_rate } = data;

  if (Date.now() > next_funding_time) {
    return null;
  }

  return est_funding_rate;
}
