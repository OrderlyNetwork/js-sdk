import { AccountStatusEnum } from "@orderly.network/types";
import { useAssetsHistoryData } from "../shared/useAssetHistory";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { useOverviewContext } from "../providers/overviewCtx";
import { useMemo } from "react";

export const useAssetsLineChartScript = () => {
  // const assetHistory = useAssetsHistoryData("portfolio_asset_history_period", {
  //   isRealtime: true,
  // });

  const assetHistory = useOverviewContext();

  const { wrongNetwork } = useAppContext();

  const filteredData = useDataTap(assetHistory.data, {
    accountStatus: AccountStatusEnum.EnableTrading,
    fallbackData: assetHistory.createFakeData(
      {
        account_value: 0,
        // pnl: 0,
      },
      { account_value: 500 }
    ),
    // fallbackData:
    //   assetHistory.data && assetHistory.data.length >= 2
    //     ? [
    //         assetHistory.data[0],
    //         assetHistory.data[assetHistory.data.length - 1],
    //       ]
    //     : assetHistory.createFakeData(
    //         {
    //           account_value: 0,
    //           // pnl: 0,
    //         },
    //         { account_value: 500 }
    //       ),
  });

  const _data = useMemo(() => {
    if (filteredData?.length ?? 0 > 0) return filteredData;
    return assetHistory.createFakeData(
      {
        account_value: 0,
        // pnl: 0,
      },
      { account_value: 500 }
    );
  }, [filteredData?.length]);

  return {
    ...assetHistory,
    wrongNetwork,
    data: _data,
    invisible: wrongNetwork || !assetHistory.data.length,
  } as const;
};

export type useAssetsLineChartScriptReturn = ReturnType<
  typeof useAssetsLineChartScript
>;
