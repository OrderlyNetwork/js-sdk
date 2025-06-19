import React from "react";
import { useCollateralContributionScript } from "./collateralContribution.script";
import { CollateralContributionUI } from "./collateralContribution.ui";

export const CollateralContributionWidget: React.FC = () => {
  const state = useCollateralContributionScript();
  return <CollateralContributionUI {...state} />;
};
