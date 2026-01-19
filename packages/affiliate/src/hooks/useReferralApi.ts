import { usePrivateQuery } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

/** Get Volume Prerequisite */
export const useVolumePrerequisite = () => {
  return usePrivateQuery<API.Referral.VolumePrerequisite>(
    "/v1/referral/multi_level/volume_prerequisite",
    {
      revalidateOnFocus: false,
    },
  );
};

/** Get Max Rebate Rate */
export const useMaxRebateRate = () => {
  return usePrivateQuery<API.Referral.MaxRebateRate>(
    "/v1/referral/multi_level/max_rebate_rate",
    {
      revalidateOnFocus: false,
    },
  );
};

/** Generate Referral Code */
export const useMultiLevelRebateInfo = () => {
  return usePrivateQuery<API.Referral.MultiLevelRebateInfo>(
    "/v1/referral/multi_level/rebate_info",
    {
      errorRetryCount: 0,
      revalidateOnFocus: false,
    },
  );
};

/**Get Multi-Level Referral Config */
export const useMultiLevelReferralConfig = () => {
  return usePrivateQuery<API.Referral.MultiLevelReferralConfig>(
    "/v1/referral/multi_level/admin",
    {
      revalidateOnFocus: false,
    },
  );
};

export enum StatisticsTimeRange {
  "1d" = "1d",
  "7d" = "7d",
  "30d" = "30d",
  "All" = "all_time",
}

/** Get Multi-Level Statistics */
export const useMultiLevelStatistics = (time_range: StatisticsTimeRange) => {
  return usePrivateQuery<API.Referral.MultiLevelStatistics>(
    `/v1/referral/multi_level/statistics?time_range=${time_range}`,
    {
      revalidateOnFocus: false,
    },
  );
};
