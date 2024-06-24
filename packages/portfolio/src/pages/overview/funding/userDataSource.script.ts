import {
  useFundingFeeHistory,
  useQuery,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { subtractDaysFromCurrentDate } from "@orderly.network/utils";
import { useState } from "react";

type FundingSearchParams = {
  dataRange?: Date[];
};

export const useDataSource = (params: FundingSearchParams) => {
  const [dateRange, setDateRange] = useState<Date[]>(
    params.dataRange || [subtractDaysFromCurrentDate(90), new Date()]
  );
  const [data, { isLoading }] = useFundingFeeHistory({
    dataRange: dateRange.map((date) => date.getTime()),
  });

  // const res = useQuery("v1/public/info/funding_period");

  return { dataSource: data, isLoading } as const;
};

export type UseDataSourceReturn = ReturnType<typeof useDataSource>;
