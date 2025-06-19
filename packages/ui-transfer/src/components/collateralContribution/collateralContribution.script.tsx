// import React from "react";

export const useCollateralContributionScript = () => {
  return {
    collateralContribution: 0, // Example value
  };
};

export type CollateralContributionReturns = ReturnType<
  typeof useCollateralContributionScript
>;
