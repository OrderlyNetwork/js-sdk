import { useAssetsHistoryData } from "../shared/useAssetHistory";
import { useAppContext, useDataTap } from "@orderly.network/react-app";

export const usePerformanceScript = () => {
  const state = useAssetsHistoryData("portfolio_performance_period");

  const { wrongNetwork } = useAppContext();
  // const filteredData = useDataTap(state.data, {
  //   fallbackData:
  //     state.data && state.data.length >= 2
  //       ? [state.data[0], state.data[state.data.length - 1]]
  //       : [],
  // });

  return {
    ...state,
    // data: filteredData,
    invisible: wrongNetwork,
  };
};

export type UsePerformanceScriptReturn = ReturnType<
  typeof usePerformanceScript
>;
