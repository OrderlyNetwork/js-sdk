// import React from "react";

export const useAssetSwapIndicatorScript = (props: { feeMessage: string }) => {
  return {
    ...props,
    fromToken: "ETH",
    toToken: "USDC",
  };
};

export type AssetSwapIndicatorReturns = ReturnType<
  typeof useAssetSwapIndicatorScript
>;
