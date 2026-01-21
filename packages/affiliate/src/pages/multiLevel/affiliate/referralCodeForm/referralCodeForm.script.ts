import { useMemo, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useReferralCode } from "../../../../hooks/useReferralCode";
import { ReferralCodeFormType } from "../../../../types";
import { ReferralCodeFormWidgetProps } from "./referralCodeForm.widget";

export const useReferralCodeFormScript = (
  options: ReferralCodeFormWidgetProps,
) => {
  const { type, referralCode, maxRebateRate, referrerRebateRate, accountId } =
    options;
  const { t } = useTranslation();

  const [newCode, setNewCode] = useState<string>(referralCode || "");
  const [isReview, setIsReview] = useState(false);

  const maxRebatePercentage = useMemo(() => {
    return new Decimal(maxRebateRate).mul(100).toNumber();
  }, [maxRebateRate]);

  const [referrerRebatePercentage, setReferrerRebatePercentage] = useState(
    () => {
      if (type === ReferralCodeFormType.Create) {
        return Math.ceil(maxRebatePercentage / 2);
      }
      if (referrerRebateRate) {
        return new Decimal(referrerRebateRate).mul(100).toNumber();
      }
      return 0;
    },
  );

  const {
    createReferralCode,
    editReferralCode,
    updateRebateRate,
    resetRebateRate,
    isMutating,
  } = useReferralCode();

  const refereeRebatePercentage = useMemo(() => {
    return Math.max(
      0,
      new Decimal(maxRebatePercentage).sub(referrerRebatePercentage).toNumber(),
    );
  }, [referrerRebatePercentage]);

  const codeChanged = useMemo(() => {
    return newCode !== referralCode;
  }, [newCode, referralCode]);

  const rateChanged = useMemo(() => {
    return (
      new Decimal(referrerRebatePercentage).toNumber() !==
      new Decimal(referrerRebateRate || 0).mul(100).toNumber()
    );
  }, [referrerRebatePercentage, referrerRebateRate, newCode]);

  const handleError = (err: any) => {
    console.error("handleError", err);
    toast.error(err?.message || t("common.somethingWentWrong"));
  };

  const handleResult = (res: any) => {
    if (res.success) {
      options.onSuccess?.();
      toast.success(t("affiliate.saveChanges.success"));
      options.close?.();
    } else {
      toast.error(res.message);
    }
  };

  const onEdit = async () => {
    const editReferralCodeParams = {
      current_referral_code: referralCode!,
      new_referral_code: newCode!,
    };

    const updateRebateRateParams = {
      referee_rebate_rate: new Decimal(refereeRebatePercentage)
        .div(100)
        .toNumber(),
      account_ids: accountId ? [accountId] : undefined,
    };

    try {
      if (codeChanged && rateChanged) {
        const codeRes = await editReferralCode(editReferralCodeParams);
        if (!codeRes.success) {
          toast.error(codeRes.message);
          return;
        }
        const rateRes = await updateRebateRate(updateRebateRateParams);
        handleResult(rateRes);
      } else if (codeChanged) {
        const res = await editReferralCode(editReferralCodeParams);
        handleResult(res);
      } else if (rateChanged) {
        const res = await updateRebateRate(updateRebateRateParams);
        handleResult(res);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const onCreate = async () => {
    try {
      const referee_rebate_rate = new Decimal(refereeRebatePercentage)
        .div(100)
        .toNumber();

      const res = await createReferralCode({ referee_rebate_rate });
      if (res.success) {
        toast.success(t("affiliate.referralCode.create.success"));
        options.onSuccess?.();
        options.close?.();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      handleError(err);
    }
  };

  const onReset = async () => {
    try {
      const res = await resetRebateRate({ account_ids: [accountId!] });
      handleResult(res);
    } catch (err) {
      handleError(err);
    }
  };

  const onClick = () => {
    switch (type) {
      case ReferralCodeFormType.Create:
        onCreate();
        break;
      case ReferralCodeFormType.Edit:
        if (isReview) {
          onEdit();
        } else {
          setIsReview(true);
        }
        break;
      case ReferralCodeFormType.Reset:
        onReset();
        break;
    }
  };

  const buttonDisabled =
    type === ReferralCodeFormType.Edit && !codeChanged && !rateChanged;

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
    buttonDisabled,
    onReset,
  };
};

export type ReferralCodeFormReturns = ReturnType<
  typeof useReferralCodeFormScript
>;
