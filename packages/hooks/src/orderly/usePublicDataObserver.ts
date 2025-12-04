import { useEffect } from "react";
import { type API } from "@veltodefi/types";
import { getPrecisionByNumber } from "@veltodefi/utils";
import { useOrderlyContext } from "../orderlyContext";
import { useSymbolStore } from "../provider/store/symbolStore";
import { useQuery } from "../useQuery";
import { useAppStore } from "./appStore";
import { useMarketStore } from "./useMarket/market.store";

// import { useTokensInfoStore } from "./useTokensInfo/tokensInfo.store";

const publicQueryOptions = {
  focusThrottleInterval: 1000 * 60 * 60 * 24,
  revalidateOnFocus: false,
  dedupingInterval: 1000 * 60 * 60 * 24,
};

export const usePublicDataObserver = () => {
  const { setSymbolsInfo, setFundingRates, setRwaSymbolsInfo } = useAppStore(
    (state) => state.actions,
  );

  const { updateMarket } = useMarketStore((state) => state.actions);

  // const setTokensInfo = useTokensInfoStore((state) => state.setTokensInfo);

  const symbols = useSymbolStore((state) => state.data);

  const { dataAdapter } = useOrderlyContext();

  const resolveList =
    typeof dataAdapter?.symbolList === "function"
      ? dataAdapter.symbolList
      : (oriVal: API.MarketInfoExt[]) => oriVal;

  /**
   * symbol config
   */
  // useQuery<Record<string, API.SymbolExt>>(`/v1/public/info`, {
  //   ...publicQueryOptions,
  //   onSuccess(data: API.Symbol[]) {
  //     if (!data || !data?.length) {
  //       return {};
  //     }

  //   },
  // });

  useEffect(() => {
    if (!symbols || !symbols?.length) {
      return;
    }
    const obj: Record<string, API.SymbolExt> = {};

    for (let index = 0; index < symbols.length; index++) {
      const item = symbols[index];
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
  }, [symbols]);

  /**
   * symbol config
   */
  useQuery<Record<string, API.RwaSymbol>>(`/v1/public/rwa/info`, {
    ...publicQueryOptions,
    onSuccess(data: API.RwaSymbol[]) {
      if (!data || !data?.length) {
        return {};
      }
      const obj: Record<string, API.RwaSymbol> = {};

      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        const arr = item.symbol.split("_");
        obj[item.symbol] = {
          ...item,
          base: arr[1],
          quote: arr[2],
          type: arr[0],
          name: `${arr[1]}-${arr[0]}`,
        };
      }
      setRwaSymbolsInfo(obj);
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
    formatter(data) {
      const rowsData = data.rows;
      if (Array.isArray(rowsData)) {
        return resolveList(rowsData);
      }
      return resolveList(data);
    },
  });

  /**
   * token info
   */
  // useQuery<API.Chain[]>(`/v1/public/token`, {
  //   // revalidateOnFocus: false,
  //   ...publicQueryOptions,
  //   onSuccess(data: API.Chain[]) {
  //     if (!data || !data.length) {
  //       return [];
  //     }
  //     setTokensInfo(data);
  //   },
  // });
};

function getEstFundingRate(data: API.FundingRate) {
  if (!data) {
    return;
  }

  const { next_funding_time, est_funding_rate } = data;

  if (Date.now() > next_funding_time) {
    return null;
  }

  return est_funding_rate;
}
