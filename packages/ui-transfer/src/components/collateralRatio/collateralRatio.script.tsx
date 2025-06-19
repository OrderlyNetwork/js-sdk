// import React from "react";

export const useCollateralRatioScript = () => {
  return {
    collateralRatio: 80, // Example value
  };
};

export type CollateralRatioReturns = ReturnType<
  typeof useCollateralRatioScript
>;
