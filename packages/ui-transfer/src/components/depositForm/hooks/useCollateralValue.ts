import { useMemo } from "react";
import { useComputedLTV } from "@orderly.network/hooks";
import { account as accountPerp } from "@orderly.network/perp";
import { API } from "@orderly.network/types";

const { collateralRatio, collateralContribution } = accountPerp;

export const useCollateralValue = (params: {
  sourceToken?: API.TokenInfo;
  targetToken?: API.TokenInfo;
  quantity: string;
  indexPrice?: number;
}) => {
  const { sourceToken, targetToken, indexPrice } = params;

  const quantity = Number(params.quantity);

  const memoizedCollateralRatio = useMemo(() => {
    return collateralRatio({
      baseWeight: targetToken?.base_weight ?? 0,
      discountFactor: targetToken?.discount_factor ?? 0,
      collateralQty: quantity,
      collateralCap: sourceToken?.user_max_qty ?? quantity,
      indexPrice: indexPrice ?? 0,
    });
  }, [targetToken, quantity, sourceToken?.user_max_qty, indexPrice]);

  const collateralContributionQuantity = useMemo(() => {
    return collateralContribution({
      collateralQty: quantity,
      collateralCap: sourceToken?.user_max_qty ?? quantity,
      collateralRatio: memoizedCollateralRatio.toNumber(),
      indexPrice: indexPrice ?? 0,
    });
  }, [
    quantity,
    sourceToken?.user_max_qty,
    memoizedCollateralRatio,
    indexPrice,
  ]);

  const currentLTV = useComputedLTV();

  const nextLTV = useComputedLTV({
    input: quantity,
    token: sourceToken?.symbol,
  });

  return {
    collateralRatio: memoizedCollateralRatio.toNumber(),
    collateralContributionQuantity,
    currentLTV,
    nextLTV,
  };
};
