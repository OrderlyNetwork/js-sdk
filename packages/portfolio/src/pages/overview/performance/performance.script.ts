import { useAssetsHistoryData } from "../shared/useAssetHistory";

export const usePerformanceScript = () => {
  return useAssetsHistoryData("portfolio_performance_period");
};

export type UsePerformanceScriptReturn = ReturnType<
  typeof usePerformanceScript
>;
