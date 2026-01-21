import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import {
  useMaxRebateRate,
  useMultiLevelRebateInfo,
  useVolumePrerequisite,
} from "./useReferralApi";

export const useMultiLevelReferralData = () => {
  const { data: volumePrerequisite, isLoading: volumePrerequisiteLoading } =
    useVolumePrerequisite();

  const { data: maxRebateRateRes, isLoading: maxRebateRateLoading } =
    useMaxRebateRate();

  const {
    data: multiLevelRebateInfoRes,
    mutate: multiLevelRebateInfoMutate,
    isLoading: multiLevelRebateInfoLoading,
  } = useMultiLevelRebateInfo();

  const isMultiLevelReferralUnlocked =
    volumePrerequisite &&
    volumePrerequisite.current_volume >= volumePrerequisite.required_volume;

  // if maxRebateRateRes is undefined, it means the multi-level referral is not enabled
  const isMultiLevelEnabled = !!maxRebateRateRes;
  const maxRebateRate = maxRebateRateRes?.max_rebate_rate;

  const multiLevelRebateInfo = useMemo(() => {
    if (!multiLevelRebateInfoRes) return;

    const {
      default_referee_rebate_rate: referee_rebate_rate,
      max_rebate_rate,
    } = multiLevelRebateInfoRes;

    const referrer_rebate_rate = new Decimal(max_rebate_rate || 0)
      .sub(referee_rebate_rate || 0)
      .toNumber();

    return {
      ...multiLevelRebateInfoRes,
      referee_rebate_rate,
      referrer_rebate_rate,
    };
  }, [multiLevelRebateInfoRes, maxRebateRate]);

  const isLoading =
    volumePrerequisiteLoading ||
    maxRebateRateLoading ||
    multiLevelRebateInfoLoading;

  return {
    volumePrerequisite,
    maxRebateRate,
    multiLevelRebateInfo,
    isMultiLevelEnabled,
    isMultiLevelReferralUnlocked,
    multiLevelRebateInfoMutate,
    isLoading,
  };
};

export type MultiLevelReferralData = ReturnType<
  typeof useMultiLevelReferralData
>;
