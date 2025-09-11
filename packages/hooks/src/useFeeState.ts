import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import { useAccountInfo } from "./orderly/useAccountInfo";
import type { RefferalAPI } from "./referral";
import { usePrivateQuery } from "./usePrivateQuery";
import { noCacheConfig } from "./utils";

const ORDERLY_TAKER_FEE_BPS = 1; // 0.01%
const ORDERLY_MAKER_FEE_BPS = 0; // 0%

const bpsToFraction = (bps?: number) => new Decimal(bps ?? 0).mul(0.0001); // 1 bps -> 0.0001

const formatFractionAsPercent = (val: Decimal) => `${val.mul(100).toNumber()}%`;

// Formula: effective = user - (user - orderly) * rebate
const computeEffectiveFromBps = (
  userBps?: number,
  orderlyBps?: number,
  rebate?: number,
) => {
  const user = bpsToFraction(userBps);
  const orderly = bpsToFraction(orderlyBps);
  const effective = user.sub(user.sub(orderly).mul(rebate ?? 0));
  return effective;
};

export const useFeeState = () => {
  const { data: accountInfo, isLoading: isAccountLoading } = useAccountInfo();

  const { data: referralData, isLoading: isReferralLoading } =
    usePrivateQuery<RefferalAPI.ReferralInfo>("/v1/referral/info", {
      revalidateOnFocus: true,
      errorRetryCount: 3,
      ...noCacheConfig,
    });

  const takerFeeBps = accountInfo?.futures_taker_fee_rate;
  const makerFeeBps = accountInfo?.futures_maker_fee_rate;

  const refereeRebate = referralData?.referee_info?.referee_rebate_rate;

  const takerFee = useMemo(() => {
    if (isAccountLoading || takerFeeBps === null || takerFeeBps === undefined) {
      return "-";
    }
    return formatFractionAsPercent(bpsToFraction(takerFeeBps));
  }, [isAccountLoading, takerFeeBps]);

  const makerFee = useMemo(() => {
    if (isAccountLoading || makerFeeBps === null || makerFeeBps === undefined) {
      return "-";
    }
    return formatFractionAsPercent(bpsToFraction(makerFeeBps));
  }, [isAccountLoading, makerFeeBps]);

  const effectiveTakerFee = useMemo(() => {
    if (isReferralLoading) {
      return "-";
    }
    const effective = computeEffectiveFromBps(
      takerFeeBps,
      ORDERLY_TAKER_FEE_BPS,
      refereeRebate,
    );
    return formatFractionAsPercent(effective);
  }, [takerFeeBps, refereeRebate, isReferralLoading]);

  const effectiveMakerFee = useMemo(() => {
    if (isReferralLoading) {
      return "-";
    }
    const effective = computeEffectiveFromBps(
      makerFeeBps,
      ORDERLY_MAKER_FEE_BPS,
      refereeRebate,
    );
    return formatFractionAsPercent(effective);
  }, [makerFeeBps, refereeRebate, isReferralLoading]);

  return {
    takerFee,
    makerFee,
    refereeRebate,
    effectiveTakerFee,
    effectiveMakerFee,
  } as const;
};
