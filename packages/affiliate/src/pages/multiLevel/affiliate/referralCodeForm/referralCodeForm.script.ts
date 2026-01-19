import { useMemo, useState } from "react";
import { useReferralCode } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { ReferralCodeFormWidgetProps } from "./referralCodeForm.widget";

export const useReferralCodeFormScript = (
  options: ReferralCodeFormWidgetProps,
) => {
  const { type, referralCode, maxRebateRate, referrerRebateRate } = options;
  const [newCode, setNewCode] = useState<string>(referralCode || "");
  const [isReview, setIsReview] = useState(false);

  const { t } = useTranslation();
  const maxRebatePercentage = useMemo(() => {
    return new Decimal(maxRebateRate).mul(100).toNumber();
  }, [maxRebateRate]);

  const [referrerRebatePercentage, setReferrerRebatePercentage] = useState(
    type === "create"
      ? Math.ceil(maxRebatePercentage / 2)
      : referrerRebateRate
        ? new Decimal(referrerRebateRate).mul(100).toNumber()
        : 0,
  );

  const { createReferralCode, editReferralCode, updateRebateRate, isMutating } =
    useReferralCode();

  const codeChanged = useMemo(() => {
    return newCode !== referralCode;
  }, [newCode, referralCode]);

  const rateChanged = useMemo(() => {
    return (
      new Decimal(referrerRebatePercentage).toNumber() !==
      new Decimal(referrerRebateRate || 0).mul(100).toNumber()
    );
  }, [referrerRebatePercentage, referrerRebateRate, newCode]);

  const refereeRebatePercentage = useMemo(() => {
    return new Decimal(maxRebatePercentage)
      .sub(referrerRebatePercentage)
      .toNumber();
  }, [referrerRebatePercentage]);

  const handleSuccess = () => {
    options.onSuccess?.();
    toast.success(t("affiliate.changesSaved"));
    options.close?.();
  };

  const handleError = (err: any) => {
    console.error("onEdit error", err);
    toast.error(err?.message || t("common.somethingWentWrong"));
  };

  const onEdit = async () => {
    const editReferralCodeParams = {
      current_referral_code: referralCode,
      new_referral_code: newCode,
    };

    const updateRebateRateParams = {
      referee_rebate_rate: new Decimal(refereeRebatePercentage)
        .div(100)
        .toNumber(),
    };

    try {
      if (codeChanged && rateChanged) {
        const codeRes = await editReferralCode(editReferralCodeParams);
        if (!codeRes.success) {
          toast.error(codeRes.message);
          return;
        }
        const rateRes = await updateRebateRate(updateRebateRateParams);
        if (rateRes.success) {
          handleSuccess();
        } else {
          toast.error(rateRes.message);
        }
      } else if (codeChanged) {
        const res = await editReferralCode(editReferralCodeParams);
        if (res.success) {
          handleSuccess();
        } else {
          toast.error(res.message);
        }
      } else if (rateChanged) {
        const res = await updateRebateRate(updateRebateRateParams);
        if (res.success) {
          handleSuccess();
        } else {
          toast.error(res.message);
        }
      }
    } catch (err) {
      handleError(err);
    }
  };

  const onCreate = async () => {
    const res = await createReferralCode({
      referee_rebate_rate: new Decimal(refereeRebatePercentage)
        .div(100)
        .toNumber(),
    });
    if (res.success) {
      toast.success(t("affiliate.referralCode.create.success"));
      options.onSuccess?.();
      options.close?.();
    } else {
      handleError(res);
    }
  };

  const onClick = () => {
    if (type === "create") {
      onCreate();
    } else if (type === "edit" && !isReview) {
      setIsReview(true);
    } else if (type === "edit" && isReview) {
      onEdit();
    }
  };

  const disabled = type === "edit" && !codeChanged && !rateChanged;

  return {
    onClick,
    maxRebatePercentage,
    referrerRebatePercentage,
    setReferrerRebatePercentage,
    refereeRebatePercentage,
    isMutating,
    newCode,
    setNewCode,
    isReview,
    disabled,
  };
};

export type ReferralCodeFormReturns = ReturnType<
  typeof useReferralCodeFormScript
>;
