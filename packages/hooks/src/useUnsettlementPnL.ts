// import

import { API } from "@orderly.network/types";
import { usePrivateQuery } from "./usePrivateQuery";
import { useMemo } from "react";
import { positions } from "@orderly.network/futures";
import { useFundingRates } from "./orderly/useFundingRates";

export const useUnsettlementPnL = () => {
  const { data } = usePrivateQuery<API.PositionInfo>("/v1/positions`);
  const fundingRates = useFundingRates();

  const unSettlementPnL = useMemo(() => {
    // return positions.totalUnsettlementPnL(
    //     data?.rows.map((item) => ({
    //       ...item,
    //       sum_unitary_funding: fundingRates[item.symbol]?.(
    //         "sum_unitary_funding",
    //         0
    //       ),
    //     }))
    //   );
    return 0;
  }, [data]);

  return unSettlementPnL;
};
