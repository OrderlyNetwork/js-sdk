import { useMemo } from "react";
import { RefferalAPI, useRefereeInfo } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { useReferralContext } from "../provider";
import { StatisticsTimeRange } from "../types";
import { copyText } from "../utils/utils";
import {
  useMultiLevelRebateInfo,
  useMultiLevelStatistics,
} from "./useReferralApi";

type LegacyReferralCode = NonNullable<
  NonNullable<RefferalAPI.ReferralInfo["referrer_info"]>["referral_codes"]
>[number];

export type MultiLevelReferralCodeRow = {
  code: string;
  max_rebate_rate: number;
  referee_rebate_rate: number;
  referrer_rebate_rate: number;
  total_invites: number;
  total_traded: number;
  total_volume: number;
  total_rebate: number;
  referral_type: "multi";
  multi_level_statistics?: API.Referral.MultiLevelStatistics;
};

export type SingleLevelReferralCodeRow = LegacyReferralCode & {
  referral_type: "single";
};

export type ReferralCodesRow =
  | MultiLevelReferralCodeRow
  | SingleLevelReferralCodeRow;

export type UseMultiLevelReferralCodesReturns = {
  codes?: ReferralCodesRow[];
  copyCode: (code: string) => void;
};

export const useMultiLevelReferralCodes =
  (): UseMultiLevelReferralCodesReturns => {
    const { referralInfo } = useReferralContext();
    const { data: multiLevelRebateInfo } = useMultiLevelRebateInfo();
    const { data: multiLevelStatistics } = useMultiLevelStatistics(
      StatisticsTimeRange.All,
    );
    const [refereesData] = useRefereeInfo({});

    const copyCode = (code: string) => {
      copyText(code);
    };

    const singleLevelTotals = useMemo(() => {
      const totalsMap = new Map<
        string,
        { volume: number; commission: number }
      >();

      if (refereesData) {
        refereesData.forEach((referee: any) => {
          const code = referee?.referral_code;
          if (!code) return;
          const existing = totalsMap.get(code) || { volume: 0, commission: 0 };
          totalsMap.set(code, {
            volume: existing.volume + (referee?.volume || 0),
            commission: existing.commission + (referee?.referral_rebate || 0),
          });
        });
      }

      return totalsMap;
    }, [refereesData]);

    const codes = useMemo((): ReferralCodesRow[] | undefined => {
      const allCodes: ReferralCodesRow[] = [];
      const multiLevelReferralCode = multiLevelRebateInfo?.referral_code;

      // Add multi-level code if present
      if (multiLevelRebateInfo?.referral_code) {
        const maxRebateRate = multiLevelRebateInfo.max_rebate_rate ?? 0;
        const defaultRefereeRebateRate =
          multiLevelRebateInfo.default_referee_rebate_rate ?? 0;
        const referrerRebateRate = Math.max(
          0,
          maxRebateRate - defaultRefereeRebateRate,
        );

        const directInvites = multiLevelStatistics?.direct_invites ?? 0;
        const indirectInvites = multiLevelStatistics?.indirect_invites ?? 0;
        const directTraded = multiLevelStatistics?.direct_traded ?? 0;
        const indirectTraded = multiLevelStatistics?.indirect_traded ?? 0;
        const directVolume = multiLevelStatistics?.direct_volume ?? 0;
        const indirectVolume = multiLevelStatistics?.indirect_volume ?? 0;
        const directRebate = multiLevelStatistics?.direct_rebate ?? 0;
        const indirectRebate = multiLevelStatistics?.indirect_rebate ?? 0;

        const multiLevelCode: MultiLevelReferralCodeRow = {
          code: multiLevelRebateInfo.referral_code ?? "",
          max_rebate_rate: maxRebateRate,
          referee_rebate_rate: defaultRefereeRebateRate,
          referrer_rebate_rate: referrerRebateRate,
          total_invites: directInvites + indirectInvites,
          total_traded: directTraded + indirectTraded,
          total_volume: directVolume + indirectVolume,
          total_rebate: directRebate + indirectRebate,
          referral_type: "multi",
          multi_level_statistics: multiLevelStatistics ?? undefined,
        };

        allCodes.push(multiLevelCode);
      }

      // Add legacy single-level codes
      if (referralInfo?.referrer_info?.referral_codes) {
        allCodes.push(
          ...referralInfo.referrer_info.referral_codes
            .filter((item) =>
              multiLevelReferralCode
                ? item.code !== multiLevelReferralCode
                : true,
            )
            .map((item) => {
              const totals = singleLevelTotals.get(item.code);
              const row: SingleLevelReferralCodeRow = {
                ...item,
                referral_type: "single",
                total_volume: totals?.volume ?? item.total_volume ?? 0,
                total_rebate: totals?.commission ?? item.total_rebate ?? 0,
              };
              return row;
            }),
        );
      }

      if (allCodes.length === 0) return undefined;
      return allCodes;
    }, [
      referralInfo?.referrer_info?.referral_codes,
      multiLevelRebateInfo,
      multiLevelStatistics,
      singleLevelTotals,
    ]);

    return {
      codes,
      copyCode,
    };
  };
