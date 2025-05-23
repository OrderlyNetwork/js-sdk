import { createContext, useContext, PropsWithChildren } from "react";
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

export const OverviewContextProvider = (
  props: PropsWithChildren<{ type?: TWType }>,
) => {
  const state = useAssetsHistoryData(localKey, { isRealtime: true });
  const rewardsData = useRewardsData({ type: props.type });

  return (
    <OverviewContext.Provider
      value={{
        ...state,
        type: props.type,
        ...rewardsData,
      }}
    >
      {props.children}
    </OverviewContext.Provider>
  );
};
