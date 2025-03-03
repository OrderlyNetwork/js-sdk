import { AccountStatusEnum } from "@orderly.network/types";
import { useAssetsHistoryData } from "../shared/useAssetHistory";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { useOverviewContext } from "../providers/overviewCtx";
import { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";

export const useAssetsLineChartScript = () => {
  // const assetHistory = useAssetsHistoryData("portfolio_asset_history_period", {
  //   isRealtime: true,
  // });

  const assetHistory = useOverviewContext();

  const { wrongNetwork, disabledConnect } = useAppContext();
  const { state } = useAccount();

  const filteredData = useDataTap(assetHistory.data, {
    accountStatus:
      state.status === AccountStatusEnum.EnableTradingWithoutConnected
        ? AccountStatusEnum.EnableTradingWithoutConnected
        : AccountStatusEnum.EnableTrading,
    fallbackData: assetHistory.createFakeData(
      {
        account_value: 0,
        // pnl: 0,
      },
      { account_value: 500 }
    ),
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
  }, [filteredData]);

  const invisible =
    wrongNetwork || disabledConnect || !assetHistory.data.length;

  return {
    ...assetHistory,
    data: _data,
    invisible,
  } as const;
};

export type useAssetsLineChartScriptReturn = ReturnType<
  typeof useAssetsLineChartScript
>;
