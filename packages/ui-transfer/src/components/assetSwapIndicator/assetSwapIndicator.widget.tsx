import React from "react";
import { AssetSwapIndicatorUI } from "./assetSwapIndicator.ui";

export const AssetSwapIndicatorWidget: React.FC<
  Readonly<Record<"sourceToken" | "targetToken", string>>
> = (props) => {
  return <AssetSwapIndicatorUI {...props} />;
};
