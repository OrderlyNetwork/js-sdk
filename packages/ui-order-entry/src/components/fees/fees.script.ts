import { useMemo } from "react";
import { usePrivateQuery } from "@orderly.network/hooks";
import type { RefferalAPI } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

const ORDERLY_TAKER_FEE = 0.0001; // (0.01%)
const ORDERLY_MAKER_FEE = 0; // (0%)

export const useFeesScript = () => {
  const { data, isLoading } = usePrivateQuery<RefferalAPI.ReferralInfo>(
    "/v1/referral/info",
    {
      revalidateOnFocus: true,
    },
  );

  const rebateRate = data?.referee_info?.referee_rebate_rate;

  const takerFeeRate = useMemo(() => {
    if (isLoading) {
      return undefined;
    }
    if (typeof rebateRate === "undefined" || rebateRate === null) {
      return undefined;
    }
    // return `${new Decimal(rebateRate).mul(0.01).toString()}%`;
  }, [rebateRate, isLoading]);

  const makerFeeRate = useMemo(() => {
    if (isLoading) {
      return undefined;
    }
    if (typeof rebateRate === "undefined" || rebateRate === null) {
      return undefined;
    }
    // return `${new Decimal(rebateRate).mul(0.01).toString()}%`;
  }, [rebateRate, isLoading]);

  return { takerFeeRate, makerFeeRate } as const;
};
