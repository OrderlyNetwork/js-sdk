import React from "react";
// import { useCollateralRatioScript } from "./collateralRatio.script";
import { CollateralRatioUI } from "./collateralRatio.ui";

export const CollateralRatioWidget: React.FC<{ value: number }> = (props) => {
  return <CollateralRatioUI {...props} />;
};
