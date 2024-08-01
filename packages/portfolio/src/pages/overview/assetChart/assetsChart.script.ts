import { useAssetsHistoryData } from "../shared/useAssetHistory";
import { useAppContext } from "@orderly.network/react-app";

export const useAssetsLineChartScript = () => {
  const assetHistory = useAssetsHistoryData("portfolio_asset_history_period", {
    isRealtime: true,
  });

  const { wrongNetwork } = useAppContext();

  return {
    ...assetHistory,
    wrongNetwork,
  } as const;
};

export type useAssetsLineChartScriptReturn = ReturnType<
  typeof useAssetsLineChartScript
>;
