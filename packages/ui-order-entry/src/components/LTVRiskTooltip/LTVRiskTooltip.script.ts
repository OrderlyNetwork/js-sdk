import { useCallback } from "react";
import {
  useCurrentLtv,
  useHoldingStream,
  useQuery,
} from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";

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
  const { data: holdingList = [], isLoading: isHoldingLoading } =
    useHoldingStream();

  const {
    ltv_threshold,
    negative_usdc_threshold,
    isLoading: isThresholdLoading,
  } = useConvertThreshold();

  const currentLtv = useCurrentLtv();

  const onConvert = useCallback(async () => {
    return modal.show("ConvertDialogId");
  }, []);

  return {
    holdingList,
    isHoldingLoading,
    ltv_threshold,
    negative_usdc_threshold,
    isThresholdLoading,
    currentLtv: currentLtv,
    onConvert: onConvert,
  };
};

export type LTVTooltipScriptReturn = ReturnType<typeof useLTVTooltipScript>;
