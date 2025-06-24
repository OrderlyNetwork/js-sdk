import React from "react";
// import { useCollateralRatioScript } from "./collateralRatio.script";
import { CollateralRatioUI } from "./collateralRatio.ui";

export const CollateralRatioWidget: React.FC<
  Readonly<{ collateralRatio: number }>
> = (props) => {
  return <CollateralRatioUI {...props} />;
};
