import { AccountStatusEnum } from "@orderly.network/types";
import { useAssetsHistoryData } from "../shared/useAssetHistory";
import { useAppContext, useDataTap } from "@orderly.network/react-app";

export const useAssetsLineChartScript = () => {
  const assetHistory = useAssetsHistoryData("portfolio_asset_history_period", {
    isRealtime: true,
  });

  const { wrongNetwork } = useAppContext();

  const filteredData = useDataTap(assetHistory.data, {
    accountStatus: AccountStatusEnum.EnableTrading,
    fallbackData:
      assetHistory.data && assetHistory.data.length >= 2
        ? [
            assetHistory.data[0],
            assetHistory.data[assetHistory.data.length - 1],
          ]
        : assetHistory.createFakeData(
            {
              account_value: 0,
              // pnl: 0,
            },
            { account_value: 1000 }
          ),
  });

  return {
    ...assetHistory,
    wrongNetwork,
    data: filteredData,
    invisible: wrongNetwork || !assetHistory.data.length,
  } as const;
};

export type useAssetsLineChartScriptReturn = ReturnType<
  typeof useAssetsLineChartScript
>;
