import React from "react";
// import { useCollateralContributionScript } from "./collateralContribution.script";
import { CollateralContributionUI } from "./collateralContribution.ui";

export const CollateralContributionWidget: React.FC<
  Readonly<{ collateralContribution: number; token: string }>
> = (props) => {
  return <CollateralContributionUI {...props} />;
};
