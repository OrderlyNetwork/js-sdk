import { useMemo } from "react";
import {
  useHoldingStream,
  useIndexPricesStream,
  usePositionStream,
  useQuery,
} from "@orderly.network/hooks";
import { account } from "@orderly.network/perp";
import { useDataTap } from "@orderly.network/react-app";
import type { API } from "@orderly.network/types";

const { LTV, collateralRatio } = account;

const useConvertThreshold = () => {
  const { data, error, isLoading } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    { errorRetryCount: 3 },
  );
  return {
    ltv_threshold: data?.ltv_threshold,
    negative_usdc_threshold: data?.negative_usdc_threshold,
    isLoading,
    error,
  } as const;
};

export const useLTVTooltipScript = () => {
  const {
    usdc,
    data: holdingList = [],
    isLoading: isHoldingLoading,
  } = useHoldingStream();

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isThresholdLoading,
  } = useConvertThreshold();

  const { data: testTokenChainsRes } = useQuery<API.Chain[]>(
    "https://testnet-api.orderly.org/v1/public/token",
    {},
  );

  const { data: indexPrices } = useIndexPricesStream();

  const [data] = usePositionStream();

  const aggregated = useDataTap(data.aggregated);
  const unrealPnL = aggregated?.total_unreal_pnl ?? 0;

  const currentLtv = useMemo(() => {
    const usdcBalance = usdc?.holding ?? 0;
    return LTV({
      usdcBalance: usdcBalance,
      upnl: unrealPnL,
      collateralAssets: holdingList.map((item) => {
        const indexPrice = item.token === "USDC" ? 1 : indexPrices[item.token];
        const findToken = testTokenChainsRes?.find(
          (token) => token.token === item.token,
        );
        const qty = item?.holding ?? 0;
        return {
          qty: qty,
          indexPrice: indexPrice ?? 1,
          weight: collateralRatio({
            baseWeight: findToken?.base_weight ?? 0,
            discountFactor: findToken?.discount_factor ?? 0,
            collateralQty: qty,
            indexPrice: indexPrice ?? 1,
          }),
        };
      }),
    });
  }, [usdc?.holding, unrealPnL, holdingList, indexPrices, testTokenChainsRes]);

  return {
    holdingList,
    isHoldingLoading,
    ltv_threshold,
    negative_usdc_threshold,
    isThresholdLoading,
    currentLtv,
  };
};

export type LTVTooltipScriptReturn = ReturnType<typeof useLTVTooltipScript>;
