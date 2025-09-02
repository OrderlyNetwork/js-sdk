import { useMemo } from "react";
import { useAccountInfo, usePrivateQuery } from "@orderly.network/hooks";
import type { RefferalAPI } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";

const ORDERLY_TAKER_FEE = 0.0001; // (0.01%)
const ORDERLY_MAKER_FEE = 0; // (0%)

export const useFeesScript = () => {
  const { data: accountInfo, isLoading: isAccountInfoLoading } =
    useAccountInfo();

  const { data: referralData, isLoading: isReferralLoading } =
    usePrivateQuery<RefferalAPI.ReferralInfo>("/v1/referral/info?a=1", {
      revalidateOnFocus: true,
    });

  const effectiveTakerFee = useMemo(() => {
    if (isAccountInfoLoading || isReferralLoading) {
      return "-";
    }
    const userTakerFee = new Decimal(accountInfo?.futures_taker_fee_rate ?? 0);
    const calculatedFee = userTakerFee
      .sub(
        userTakerFee
          .sub(ORDERLY_TAKER_FEE)
          .mul(referralData?.referee_info?.referee_rebate_rate ?? 0),
      )
      .mul(0.01);
    return `${calculatedFee.toNumber()}%`;
  }, [accountInfo, referralData, isAccountInfoLoading, isReferralLoading]);

  const effectiveMakerFee = useMemo(() => {
    if (isAccountInfoLoading || isReferralLoading) {
      return "-";
    }
    const userMakerFee = new Decimal(accountInfo?.futures_maker_fee_rate ?? 0);
    const calculatedFee = userMakerFee
      .sub(
        userMakerFee
          .sub(ORDERLY_MAKER_FEE)
          .mul(referralData?.referee_info?.referee_rebate_rate ?? 0),
      )
      .mul(0.01);
    return `${calculatedFee.toNumber()}%`;
  }, [accountInfo, referralData, isAccountInfoLoading, isReferralLoading]);

  return {
    takerFeeRate: effectiveTakerFee,
    makerFeeRate: effectiveMakerFee,
  } as const;
};
