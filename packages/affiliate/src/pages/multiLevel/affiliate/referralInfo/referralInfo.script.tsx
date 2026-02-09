import { useMemo } from "react";
import { modal } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useReferralContext } from "../../../../provider";
import { ReferralCodeFormField, ReferralCodeFormType } from "../../../../types";
import { generateReferralLink } from "../../../../utils/utils";
import { ReferralCodeFormDialogId } from "../referralCodeForm/modal";

export type ReferralInfoReturns = ReturnType<typeof useReferralInfoScript>;

export const useReferralInfoScript = () => {
  const {
    referralLinkUrl,
    multiLevelRebateInfo,
    multiLevelRebateInfoMutate,
    maxRebateRate,
  } = useReferralContext();

  const referralCode = multiLevelRebateInfo?.referral_code;

  const referralLink = useMemo(() => {
    if (!referralCode) return "";

    return generateReferralLink(referralLinkUrl, referralCode);
  }, [referralCode]);

  const referrerRebateRate = useMemo(() => {
    return new Decimal(multiLevelRebateInfo?.referrer_rebate_rate || 0)
      .mul(100)
      .toNumber();
  }, [multiLevelRebateInfo]);

  const refereeRebateRate = useMemo(() => {
    return new Decimal(multiLevelRebateInfo?.referee_rebate_rate || 0)
      .mul(100)
      .toNumber();
  }, [multiLevelRebateInfo]);

  const directBonusRebateRate = useMemo(() => {
    return new Decimal(multiLevelRebateInfo?.direct_bonus_rebate_rate ?? 0)
      .mul(100)
      .toNumber();
  }, [multiLevelRebateInfo]);

  const onEdit = (focusField?: ReferralCodeFormField) => {
    modal.show(ReferralCodeFormDialogId, {
      type: ReferralCodeFormType.Edit,
      focusField,
      referralCode: multiLevelRebateInfo?.referral_code,
      maxRebateRate,
      referrerRebateRate: multiLevelRebateInfo?.referrer_rebate_rate,
      directInvites: multiLevelRebateInfo?.direct_invites,
      directBonusRebateRate,
      onSuccess: () => {
        multiLevelRebateInfoMutate();
      },
    });
  };

  return {
    onEdit,
    referralCode,
    referralLink,
    multiLevelRebateInfo,
    referrerRebateRate,
    refereeRebateRate,
    directBonusRebateRate,
  };
};
