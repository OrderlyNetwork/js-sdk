import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { modal, toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useReferralContext } from "../../../../provider";
import { generateReferralLink } from "../../../../utils/utils";
import { ReferralCodeFormDialogId } from "../referralCodeForm/modal";

export type ReferralInfoReturns = ReturnType<typeof useReferralInfoScript>;

export const useReferralInfoScript = () => {
  const { t } = useTranslation();

  const onCopy = (value: string) => {
    toast.success(t("common.copy.copied"));
  };

  const {
    referralLinkUrl,
    multiLevelRebateInfo,
    multiLevelRebateInfoMutate,
    max_rebate_rate,
  } = useReferralContext();

  const referralCode = multiLevelRebateInfo?.referral_code;

  const referralLink = useMemo(() => {
    if (!referralCode) return "";

    return generateReferralLink(referralLinkUrl, referralCode);
  }, [referralCode]);

  const onEdit = (field?: "referralCode" | "rebateRate") => {
    modal.show(ReferralCodeFormDialogId, {
      type: "edit",
      field,
      referralCode: multiLevelRebateInfo?.referral_code,
      maxRebateRate: max_rebate_rate,
      referrerRebateRate: multiLevelRebateInfo?.referrer_rebate_rate,
      onSuccess: () => {
        multiLevelRebateInfoMutate();
      },
    });
  };

  const referrerRebateRate = useMemo(() => {
    return new Decimal(multiLevelRebateInfo?.referrer_rebate_rate || 0)
      .mul(100)
      .toNumber();
  }, [multiLevelRebateInfo?.referrer_rebate_rate]);

  const refereeRebateRate = useMemo(() => {
    return new Decimal(multiLevelRebateInfo?.referee_rebate_rate || 0)
      .mul(100)
      .toNumber();
  }, [multiLevelRebateInfo?.referee_rebate_rate]);

  return {
    onCopy,
    onEdit,
    referralCode,
    referralLink,
    multiLevelRebateInfo,
    referrerRebateRate,
    refereeRebateRate,
  };
};
