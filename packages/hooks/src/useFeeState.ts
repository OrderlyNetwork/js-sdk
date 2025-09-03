import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import { useAccountInfo } from "./orderly/useAccountInfo";
import type { RefferalAPI } from "./referral";
import { usePrivateQuery } from "./usePrivateQuery";

const ORDERLY_TAKER_FEE = 0.0001; // (0.01%)
const ORDERLY_MAKER_FEE = 0; // (0%)

export const useFeeState = () => {
  const { data: accountInfo, isLoading: isAccountLoading } = useAccountInfo();

  const { data: referralData, isLoading: isReferralLoading } =
    usePrivateQuery<RefferalAPI.ReferralInfo>("/v1/referral/info?a=1", {
      revalidateOnFocus: true,
    });

  const takerFee = accountInfo?.futures_taker_fee_rate;

  const makerFee = accountInfo?.futures_maker_fee_rate;

  const rebateRate = referralData?.referee_info?.referee_rebate_rate;

  const effectiveTakerFee = useMemo(() => {
    if (isReferralLoading) {
      return "-";
    }
    const userTakerFee = new Decimal(takerFee ?? 0);
    const calculatedFee = userTakerFee
      .sub(userTakerFee.sub(ORDERLY_TAKER_FEE).mul(rebateRate ?? 0))
      .mul(0.01);
    return `${calculatedFee.toNumber()}%`;
  }, [takerFee, rebateRate, isReferralLoading]);

  const effectiveMakerFee = useMemo(() => {
    if (isReferralLoading) {
      return "-";
    }
    const userMakerFee = new Decimal(makerFee ?? 0);
    const calculatedFee = userMakerFee
      .sub(userMakerFee.sub(ORDERLY_MAKER_FEE).mul(rebateRate ?? 0))
      .mul(0.01);
    return `${calculatedFee.toNumber()}%`;
  }, [makerFee, rebateRate, isReferralLoading]);

  return {
    takerFee:
      isAccountLoading || !takerFee
        ? "-"
        : `${new Decimal(takerFee).mul(0.01).toNumber()}%`,
    makerFee:
      isAccountLoading || !makerFee
        ? "-"
        : `${new Decimal(makerFee).mul(0.01).toNumber()}%`,
    rebateRate: rebateRate,
    effectiveTakerFee: effectiveTakerFee,
    effectiveMakerFee: effectiveMakerFee,
  } as const;
};
