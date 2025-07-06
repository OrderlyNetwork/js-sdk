import React from "react";
// import { useCollateralContributionScript } from "./collateralContribution.script";
import { CollateralContributionUI } from "./collateralContribution.ui";

export const CollateralContributionWidget: React.FC<
  Readonly<{ value: number }>
> = (props) => {
  return <CollateralContributionUI {...props} />;
};
