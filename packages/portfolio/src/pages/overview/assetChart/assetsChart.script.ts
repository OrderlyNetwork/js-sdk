import { useAssetsHistoryData } from "../shared/useAssetHistory";

export const useAssetsLineChartScript = () => {
  const assetHistory = useAssetsHistoryData("portfolio_asset_history_period", {
    isRealtime: true,
  });

  return {
    ...assetHistory,
  } as const;
};

export type useAssetsLineChartScriptReturn = ReturnType<
  typeof useAssetsLineChartScript
>;
