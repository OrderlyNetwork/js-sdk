import { useMemo } from "react";
import { useComputedLTV, useQuery } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { API } from "@kodiak-finance/orderly-types";

export const useWithdrawLTV = (params: { token: string; quantity: string }) => {
  const { token, quantity } = params;
  const { ltv_threshold } = useConvertThreshold();
  const { t } = useTranslation();

  const currentLTV = useComputedLTV();

  const nextLTV = useComputedLTV({
    input: quantity ? -Number(quantity) : 0,
    token,
  });

  const ltvWarningMessage = useMemo(() => {
    if (ltv_threshold && nextLTV) {
      const threshold = ltv_threshold * 100;
      if (nextLTV > threshold) {
        return t("transfer.withdraw.LTV.error", {
          threshold,
        });
      }
    }
    return "";
  }, [nextLTV, ltv_threshold]);

  return {
    currentLTV,
    nextLTV,
    ltvWarningMessage,
    t,
  };
};

const useConvertThreshold = () => {
  const { data } = useQuery<API.ConvertThreshold>(
    "/v1/public/auto_convert_threshold",
    {
      revalidateOnFocus: false,
    },
  );

  return {
    ltv_threshold: data?.ltv_threshold,
    negative_usdc_threshold: data?.negative_usdc_threshold,
  };
};
