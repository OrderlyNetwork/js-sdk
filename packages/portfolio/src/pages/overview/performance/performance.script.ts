import { useAssetsHistoryData } from "../shared/useAssetHistory";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

export const usePerformanceScript = () => {
  const res = useAssetsHistoryData("portfolio_performance_period", {
    isRealtime: true,
  });

  const { wrongNetwork } = useAppContext();
  // const { state } = useAccount();
  const filteredData = useDataTap(res.data, {
    accountStatus: AccountStatusEnum.EnableTrading,
    fallbackData:
      res.data && res.data.length >= 2
        ? [res.data[0], res.data[res.data.length - 1]]
        : res.createFakeData(
            {
              account_value: 0,
              pnl: 0,
            },
            { account_value: 1000, pnl: 1000 }
          ),
  });

  // console.log("filteredData", filteredData, res.data);

  return {
    ...res,
    data: filteredData,
    invisible: wrongNetwork || !res.data.length,
  };
};

export type UsePerformanceScriptReturn = ReturnType<
  typeof usePerformanceScript
>;
