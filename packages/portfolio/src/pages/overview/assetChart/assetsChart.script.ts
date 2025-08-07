import { useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useAppContext, useDataTap } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { useOverviewContext } from "../provider/overviewContext";

export const useAssetsChartScript = () => {
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
      { account_value: 500 },
    ),
  });

  const _data = useMemo(() => {
    if (filteredData?.length ?? 0 > 0) return filteredData;
    return assetHistory.createFakeData(
      {
        account_value: 0,
        // pnl: 0,
      },
      { account_value: 500 },
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

export type useAssetsChartScriptReturn = ReturnType<
  typeof useAssetsChartScript
>;
