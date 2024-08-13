import { createContext, useContext } from "react";
import {
  useAssetsHistoryData,
  useAssetsHistoryDataReturn,
} from "../shared/useAssetHistory";

export type OverviewContextState = {
  // period: PeriodType;
} & useAssetsHistoryDataReturn;

export const OverviewContext = createContext<OverviewContextState>(
  {} as OverviewContextState
);

const localKey = "portfolio_performance_period";

export const useOverviewContext = () => {
  return useContext(OverviewContext);
};

export const OverviewContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const state = useAssetsHistoryData(localKey, { isRealtime: true });

  return (
    <OverviewContext.Provider
      value={{
        ...state,
      }}
    >
      {children}
    </OverviewContext.Provider>
  );
};
