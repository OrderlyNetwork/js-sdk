import React from "react";
import { AssetSwapIndicatorUI } from "./assetSwapIndicator.ui";

export const AssetSwapIndicatorWidget: React.FC<
  Readonly<Record<"fromToken" | "toToken", string>>
> = (props) => {
  return <AssetSwapIndicatorUI {...props} />;
};
