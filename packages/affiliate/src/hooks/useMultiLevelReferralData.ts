import { useMemo } from "react";
import { Decimal } from "@orderly.network/utils";
import {
  useMaxRebateRate,
  useMultiLevelRebateInfo,
  useMultiLevelReferralConfig,
  useVolumePrerequisite,
} from "./useReferralApi";

export const useMultiLevelReferralData = () => {
  const { data: volumePrerequisite, isLoading: isVolumePrerequisiteLoading } =
    useVolumePrerequisite();

  // const { data: multiLevelReferralConfig, isLoading: isMultiLevelReferralConfigLoading } =
  //   useMultiLevelReferralConfig();

  const { data: maxRebateRateRes } = useMaxRebateRate();

  const { data: multiLevelRebateInfoRes, mutate: multiLevelRebateInfoMutate } =
    useMultiLevelRebateInfo();

  const isMultiLevelReferralUnlocked =
    volumePrerequisite &&
    volumePrerequisite.current_volume >= volumePrerequisite.required_volume;

  // const isMultiLevelEnabled = multiLevelReferralConfig?.enable;
  const isMultiLevelEnabled =
    maxRebateRateRes === undefined ? undefined : !!maxRebateRateRes;
  const max_rebate_rate = maxRebateRateRes?.max_rebate_rate;

  const multiLevelRebateInfo = useMemo(() => {
    if (!multiLevelRebateInfoRes) return;

    const referee_rebate_rate =
      multiLevelRebateInfoRes?.default_referee_rebate_rate;
    const referrer_rebate_rate = new Decimal(max_rebate_rate || 0)
      .sub(referee_rebate_rate || 0)
      .toNumber();

    return {
      ...multiLevelRebateInfoRes,
      max_rebate_rate,
      referee_rebate_rate,
      referrer_rebate_rate,
    };
  }, [multiLevelRebateInfoRes, max_rebate_rate]);

  return {
    volumePrerequisite,
    max_rebate_rate,
    multiLevelRebateInfo,
    isMultiLevelEnabled,
    isMultiLevelReferralUnlocked,
    multiLevelRebateInfoMutate,
  };
};

export type MultiLevelReferralData = ReturnType<
  typeof useMultiLevelReferralData
>;
