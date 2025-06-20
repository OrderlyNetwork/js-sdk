import React from "react";
import { useAssetSwapIndicatorScript } from "./assetSwapIndicator.script";
import { AssetSwapIndicatorUI } from "./assetSwapIndicator.ui";

export const AssetSwapIndicatorWidget: React.FC<
  Readonly<{ feeMessage: string }>
> = (props) => {
  const state = useAssetSwapIndicatorScript(props);
  return <AssetSwapIndicatorUI {...state} />;
};
