import { API } from "@orderly.network/types";
import { usePrivateQuery } from "../../usePrivateQuery";
import { useMemo } from "react";
import { useSymbolsInfo } from "../useSymbolsInfo";

type DistributionSearchParams = {
  /**
   * Data range for the distribution history
   * noted that the time stamp is a 13-digits timestamp
   * the first element is the start date and the second element is the end date
   * @default [Now subtract 3 months, Now]
   */
  dataRange?: number[];
  symbol?: string;
  page?: number;
  pageSize?: number;
};

export const useDistributionHistory = (parmas: DistributionSearchParams) => {
  let { symbol, dataRange } = parmas;

  const infos = useSymbolsInfo();

  const getKey = () => {
    const search = new URLSearchParams();

    if (typeof symbol !== "undefined") {
      search.set("symbol", symbol);
    }
    search.set("page", "1");

    // if (dataRange) {
    //   search.set("start", dataRange[0].toString());
    //   search.set("end", dataRange[1].toString());
    // }

    return `/v1/client/distribution_history?${search.toString()}`;
  };
  const { data, isLoading } = usePrivateQuery<API.FundingFeeHistory>(getKey(), {
    // initialSize: 1,
    formatter: (data) => data,
    revalidateOnFocus: false,
    errorRetryCount: 3,
  });

  const parsedData = useMemo<
    (API.FundingFeeRow & {
      annual_rate: number;
    })[]
  >(() => {
    if (!Array.isArray(data?.rows) || !data?.rows.length || infos.isNil) {
      return [];
    }

    return data.rows.map((row: API.FundingFeeRow) => {
      const config = infos[row.symbol];
      return {
        ...row,
        annual_rate: row.funding_rate * (24 / config("funding_period")),
      };
    });
  }, [data, infos]);

  return [
    parsedData,
    {
      meta: data?.meta || {},
      isLoading,
    },
  ] as const;
};

export type UseDistributionHistoryReturn = ReturnType<
  typeof useDistributionHistory
>;
