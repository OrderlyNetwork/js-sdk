import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import { useAccountInfo } from "./orderly/useAccountInfo";
import type { RefferalAPI } from "./referral";
import { usePrivateQuery } from "./usePrivateQuery";

const ORDERLY_TAKER_FEE_BPS = 1; // 0.01%
const ORDERLY_MAKER_FEE_BPS = 0; // 0%

const bpsToFrac = (bps?: number) => new Decimal(bps ?? 0).mul(0.0001); // 1 bps -> 0.0001

const formatFracAsPercent = (val: Decimal) => `${val.mul(100).toNumber()}%`;

// Formula: effective = user - (user - orderly) * rebate
const computeEffectiveFromBps = (
  userBps?: number,
  orderlyBps?: number,
  rebate?: number,
) => {
  const user = bpsToFrac(userBps);
  const orderly = bpsToFrac(orderlyBps);
  const effective = user.sub(user.sub(orderly).mul(rebate ?? 0));
  return effective;
};

export const useFeeState = () => {
  const { data: accountInfo, isLoading: isAccountLoading } = useAccountInfo();

  const { data: referralData, isLoading: isReferralLoading } =
    usePrivateQuery<RefferalAPI.ReferralInfo>("/v1/referral/info", {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      dedupingInterval: 0,
      errorRetryCount: 3,
    });

  // 来自 API：单位 = bps（例：6 表示 0.06%）
  const takerFeeBps = accountInfo?.futures_taker_fee_rate;
  const makerFeeBps = accountInfo?.futures_maker_fee_rate;

  // 来自 API：单位 = fraction（例：0.2 表示 20%）
  const refereeRebate = referralData?.referee_info?.referee_rebate_rate;

  const takerFee = useMemo(() => {
    if (isAccountLoading || takerFeeBps == null) {
      return "-";
    }
    return formatFracAsPercent(bpsToFrac(takerFeeBps));
  }, [isAccountLoading, takerFeeBps]);

  const makerFee = useMemo(() => {
    if (isAccountLoading || makerFeeBps == null) {
      return "-";
    }
    return formatFracAsPercent(bpsToFrac(makerFeeBps));
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
    return formatFracAsPercent(effective);
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
    return formatFracAsPercent(effective);
  }, [makerFeeBps, refereeRebate, isReferralLoading]);

  return {
    takerFee, // 原始 taker 费率（百分比字符串）
    makerFee, // 原始 maker 费率（百分比字符串）
    refereeRebate, // 返佣（fraction），例如 0.2
    effectiveTakerFee, // 有效 taker 费率（百分比字符串）
    effectiveMakerFee, // 有效 maker 费率（百分比字符串）
  } as const;
};
