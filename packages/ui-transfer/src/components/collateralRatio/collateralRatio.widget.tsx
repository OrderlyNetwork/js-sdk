import React from "react";
import { useCollateralRatioScript } from "./collateralRatio.script";
import { CollateralRatioUI } from "./collateralRatio.ui";

export const CollateralRatioWidget: React.FC = () => {
  const state = useCollateralRatioScript();
  return <CollateralRatioUI {...state} />;
};
