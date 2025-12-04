import { useCallback } from "react";
import {
  useComputedLTV,
  useHoldingStream,
  useIndexPricesStream,
  useQuery,
  useAppStore,
} from "@veltodefi/hooks";
import { account } from "@veltodefi/perp";
import type { API } from "@veltodefi/types";
import { modal } from "@veltodefi/ui";
import { Decimal, zero } from "@veltodefi/utils";

const useConvertThreshold = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    { errorRetryCount: 3 },
  );
  return {
    ltv_threshold: new Decimal(data?.ltv_threshold ?? 0).mul(100).toNumber(),
    negative_usdc_threshold: data?.negative_usdc_threshold,
    isLoading,
    error,
  } as const;
};

export const useLTVTooltipScript = () => {
  const { data: holdingList = [], isLoading: isHoldingLoading } =
    useHoldingStream();

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isThresholdLoading,
  } = useConvertThreshold();

  const tokensInfo = useAppStore((state) => state.tokensInfo);

  const { getIndexPrice } = useIndexPricesStream();

  const holdingData = holdingList.map((item) => {
    const tokenInfo = tokensInfo?.find(({ token }) => token === item.token);

    // Use extracted function for index price calculation
    const indexPrice = getIndexPrice(item.token);

    // Calculate collateral ratio for this token
    const collateralRatio = tokenInfo
      ? account.collateralRatio({
          baseWeight: tokenInfo.base_weight ?? 0,
          discountFactor: tokenInfo.discount_factor ?? 0,
          collateralQty: item.holding,
          collateralCap: tokenInfo?.user_max_qty ?? item.holding,
          indexPrice: indexPrice,
        })
      : zero;

    // Calculate collateral contribution for this token
    const collateralContribution = account.collateralContribution({
      collateralQty: item.holding,
      collateralCap: tokenInfo?.user_max_qty ?? item.holding,
      collateralRatio: collateralRatio.toNumber(),
      indexPrice: indexPrice,
    });

    return {
      ...item,
      collateralContribution: collateralContribution,
    };
  });

  const currentLtv = useComputedLTV();

  const onConvert = useCallback(async () => {
    return modal.show("ConvertDialogId");
  }, []);

  return {
    holdingData,
    isHoldingLoading,
    ltv_threshold,
    negative_usdc_threshold,
    isThresholdLoading,
    currentLtv: currentLtv,
    onConvert: onConvert,
  };
};

export type LTVTooltipScriptReturn = ReturnType<typeof useLTVTooltipScript>;
