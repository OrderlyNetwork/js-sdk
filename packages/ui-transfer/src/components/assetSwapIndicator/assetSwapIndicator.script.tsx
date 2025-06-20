// import React from "react";

export const useAssetSwapIndicatorScript = () => {
  return {
    fromToken: "ETH",
    toToken: "USDC",
  };
};

export type AssetSwapIndicatorReturns = ReturnType<
  typeof useAssetSwapIndicatorScript
>;
