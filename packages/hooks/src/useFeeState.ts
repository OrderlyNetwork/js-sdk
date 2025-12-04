import { useMemo } from "react";
import useSWRSubscription from "swr/subscription";
import { API } from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";
import { useAccountInfo } from "./orderly/useAccountInfo";
import type { RefferalAPI } from "./referral";
import { usePrivateQuery } from "./usePrivateQuery";
import { useWS } from "./useWS";
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

  const ws = useWS();
  const topic = "account";
  const { data: wsAccountData } = useSWRSubscription(
    "account",
    (_, { next }) => {
      const unsubscribe = ws.subscribe(topic, {
        onMessage: (message: any) => {
          next(null, message);
        },
      });

      return () => {
        unsubscribe?.();
      };
    },
  );

  const takerFeeBps = useMemo(() => {
    if (wsAccountData?.accountDetail?.futuresTakerFeeRate) {
      return wsAccountData?.accountDetail?.futuresTakerFeeRate;
    }
    return accountInfo?.futures_taker_fee_rate;
  }, [
    accountInfo?.futures_taker_fee_rate,
    wsAccountData?.accountDetail?.futuresTakerFeeRate,
  ]);
  const makerFeeBps = useMemo(() => {
    if (wsAccountData?.accountDetail?.futuresMakerFeeRate) {
      return wsAccountData?.accountDetail?.futuresMakerFeeRate;
    }
    return accountInfo?.futures_maker_fee_rate;
  }, [
    accountInfo?.futures_maker_fee_rate,
    wsAccountData?.accountDetail?.futuresMakerFeeRate,
  ]);
  const rwaTakerFeeBps = useMemo(() => {
    if (wsAccountData?.accountDetail?.rwaFuturesTakerFeeRate) {
      return wsAccountData?.accountDetail?.rwaFuturesTakerFeeRate;
    }
    return accountInfo?.rwa_taker_fee_rate;
  }, [
    accountInfo?.rwa_taker_fee_rate,
    wsAccountData?.accountDetail?.rwaFuturesTakerFeeRate,
  ]);
  const rwaMakerFeeBps = useMemo(() => {
    if (wsAccountData?.accountDetail?.rwaFuturesMakerFeeRate) {
      return wsAccountData?.accountDetail?.rwaFuturesMakerFeeRate;
    }
    return accountInfo?.rwa_maker_fee_rate;
  }, [
    accountInfo?.rwa_maker_fee_rate,
    wsAccountData?.accountDetail?.rwaFuturesMakerFeeRate,
  ]);

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

  const rwaTakerFee = useMemo(() => {
    if (
      isAccountLoading ||
      rwaTakerFeeBps === null ||
      rwaTakerFeeBps === undefined
    ) {
      return "-";
    }
    return formatFractionAsPercent(bpsToFraction(rwaTakerFeeBps));
  }, [isAccountLoading, rwaTakerFeeBps]);

  const rwaMakerFee = useMemo(() => {
    if (
      isAccountLoading ||
      rwaMakerFeeBps === null ||
      rwaMakerFeeBps === undefined
    ) {
      return "-";
    }
    return formatFractionAsPercent(bpsToFraction(rwaMakerFeeBps));
  }, [isAccountLoading, rwaMakerFeeBps]);

  const rwaEffectiveTakerFee = useMemo(() => {
    if (
      isAccountLoading ||
      rwaTakerFeeBps === null ||
      rwaTakerFeeBps === undefined ||
      isReferralLoading
    ) {
      return "-";
    }
    const effective = computeEffectiveFromBps(
      rwaTakerFeeBps,
      ORDERLY_MAKER_FEE_BPS,
      refereeRebate,
    );
    return formatFractionAsPercent(effective);
  }, [isAccountLoading, rwaTakerFeeBps, refereeRebate, isReferralLoading]);

  const rwaEffectiveMakerFee = useMemo(() => {
    if (
      isAccountLoading ||
      rwaMakerFeeBps === null ||
      rwaMakerFeeBps === undefined ||
      isReferralLoading
    ) {
      return "-";
    }
    const effective = computeEffectiveFromBps(
      rwaMakerFeeBps,
      ORDERLY_MAKER_FEE_BPS,
      refereeRebate,
    );
    return formatFractionAsPercent(effective);
  }, [isAccountLoading, rwaMakerFeeBps, refereeRebate, isReferralLoading]);

  return {
    takerFee,
    makerFee,
    refereeRebate,
    effectiveTakerFee,
    effectiveMakerFee,
    rwaTakerFee,
    rwaMakerFee,
    rwaEffectiveTakerFee,
    rwaEffectiveMakerFee,
  } as const;
};
