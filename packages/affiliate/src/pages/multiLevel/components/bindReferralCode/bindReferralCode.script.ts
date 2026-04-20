import { useMemo, useState } from "react";
import { useCheckReferralCode } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { useReferralCode } from "../../../../hooks/useReferralCode";
import { BindReferralCodeWidgetProps } from "./bindReferralCode.widget";

/** Matches ReferralCodeInput formatters: uppercase A–Z and digits only. */
function formatReferralCodeInput(raw: string): string {
  return String(raw)
    .replace(/[a-z]/g, (c) => c.toUpperCase())
    .replace(/[^A-Z0-9]/g, "");
}

export const useBindReferralCodeScript = (
  options: BindReferralCodeWidgetProps,
) => {
  const { t } = useTranslation();

  const [bindCodeInput, setBindCodeInput] = useState("");
  const [skipBinding, setSkipBinding] = useState(false);
  const [isAwaitingPostSuccess, setIsAwaitingPostSuccess] = useState(false);

  const formattedBindCode = useMemo(
    () => formatReferralCodeInput(bindCodeInput),
    [bindCodeInput],
  );

  const { isExist: isBindCodeExist, isLoading: isBindCodeChecking } =
    useCheckReferralCode(
      formattedBindCode.length >= 4 ? formattedBindCode : undefined,
    );

  const { bindReferralCode, isMutating } = useReferralCode();

  const getErrorMessage = (err: unknown): string | undefined => {
    if (typeof err === "object" && err !== null && "message" in err) {
      const msg = (err as { message?: unknown }).message;
      return typeof msg === "string" ? msg : undefined;
    }
    return undefined;
  };

  const handleError = (err: unknown) => {
    toast.error(getErrorMessage(err) || t("common.somethingWentWrong"));
  };

  const runAfterSuccess = async (payload: { skipped: boolean }) => {
    setIsAwaitingPostSuccess(true);
    try {
      await Promise.resolve(options.onSuccess?.(payload));
    } finally {
      setIsAwaitingPostSuccess(false);
    }
    options.close?.();
  };

  const onConfirm = async () => {
    if (skipBinding) {
      await runAfterSuccess({ skipped: true });
      return;
    }

    if (
      formattedBindCode.length < 4 ||
      formattedBindCode.length > 10 ||
      isBindCodeChecking ||
      !isBindCodeExist
    ) {
      return;
    }

    try {
      await bindReferralCode({ referral_code: formattedBindCode });
      toast.success(t("affiliate.referralCode.bound"));
      await runAfterSuccess({ skipped: false });
    } catch (err) {
      handleError(err);
    }
  };

  const buttonDisabled =
    !skipBinding &&
    (formattedBindCode.length < 4 ||
      formattedBindCode.length > 10 ||
      isBindCodeChecking ||
      !isBindCodeExist);

  const confirmButtonLoading = isMutating || isAwaitingPostSuccess;

  return {
    bindCodeInput,
    setBindCodeInput,
    skipBinding,
    setSkipBinding,
    formattedBindCode,
    isBindCodeExist,
    isBindCodeChecking,
    buttonDisabled,
    confirmButtonLoading,
    onConfirm,
  };
};

export type BindReferralCodeScriptReturns = ReturnType<
  typeof useBindReferralCodeScript
>;
