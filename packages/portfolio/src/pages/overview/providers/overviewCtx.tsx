import React, { createContext, useContext, useMemo } from "react";
import { TWType } from "@orderly.network/hooks";
import {
  useRewardsData,
  UseRewardsDataReturn,
} from "../mobile/useRewardsData.script";
import {
  useAssetsHistoryData,
  useAssetsHistoryDataReturn,
} from "../shared/useAssetHistory";

export type OverviewContextState = {
  // period: PeriodType;
  type?: TWType;
} & useAssetsHistoryDataReturn &
  UseRewardsDataReturn;

export const OverviewContext = createContext<OverviewContextState>(
  {} as OverviewContextState,
);

const localKey = "portfolio_performance_period";

export const useOverviewContext = () => {
  return useContext(OverviewContext);
};

export const OverviewContextProvider: React.FC<
  React.PropsWithChildren<{ type?: TWType }>
> = (props) => {
  const { type, children } = props;
  const state = useAssetsHistoryData(localKey, { isRealtime: true });
  const rewardsData = useRewardsData({ type: type });

  const memoizedValue = useMemo<OverviewContextState>(() => {
    return {
      ...state,
      type: type,
      ...rewardsData,
    };
  }, [state, type, rewardsData]);

  return (
    <OverviewContext.Provider value={memoizedValue}>
      {children}
    </OverviewContext.Provider>
  );
};
