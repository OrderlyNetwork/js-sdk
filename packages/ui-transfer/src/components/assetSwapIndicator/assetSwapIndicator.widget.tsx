import React from "react";
import { useAssetSwapIndicatorScript } from "./assetSwapIndicator.script";
import { AssetSwapIndicatorUI } from "./assetSwapIndicator.ui";

export const AssetSwapIndicatorWidget: React.FC = () => {
  const state = useAssetSwapIndicatorScript();
  return <AssetSwapIndicatorUI {...state} />;
};
