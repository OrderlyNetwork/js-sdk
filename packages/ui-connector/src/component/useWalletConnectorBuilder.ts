import { useEffect, useState } from "react";
import {
  useAccount,
  useGetReferralCode,
  useLazyQuery,
  useMutation,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";

export const useWalletConnectorBuilder = () => {
  const { state, createOrderlyKey, createAccount } = useAccount();
  const [refCode, setRefCode] = useState("");
  const [helpText, setHelpText] = useState("");
  const { t } = useTranslation();

  const { trigger: verifyRefCode } = useLazyQuery(
    `/v1/public/referral/verify_ref_code?referral_code=${refCode}`,
  );

  useEffect(() => {
    const refCode = localStorage.getItem("referral_code");
    if (refCode != null) {
      setRefCode(refCode);
    }
  }, []);

  const { referral_code, isLoading } = useGetReferralCode(state.accountId);

  const [bindRefCode, { error: updateOrderError, isMutating: updateMutating }] =
    useMutation("/v1/referral/bind", "POST");

  useEffect(() => {
    if (refCode.length === 0) {
      setHelpText("");
    }
  }, [refCode]);

  const enableTradingComplted = () => {
    toast.success(t("connector.walletConnected"));
    // validate ref code and bind referral code
    if (refCode.length >= 4 && refCode.length <= 10)
      bindRefCode({ referral_code: refCode }).finally(() => {
        localStorage.removeItem("referral_code");
      });
  };

  const checkRefCode = async () => {
    if (refCode.length === 0) {
      return Promise.resolve(undefined);
    }

    if (refCode.length > 0 && (refCode.length < 4 || refCode.length > 10)) {
      return Promise.resolve(t("connector.referralCode.invalid"));
    }

    const { exist } = await verifyRefCode();

    if (exist === false) {
      return Promise.resolve(t("connector.referralCode.notExist"));
    }

    return Promise.resolve(undefined);
  };

  const showRefCodeInput = (referral_code?.length || 0) === 0 && !isLoading;

  const signIn = async () => {
    if (showRefCodeInput) {
      const info = await checkRefCode();
      if (typeof info !== "undefined") {
        setHelpText(info);
        return Promise.reject(-1);
      }
    }
    setHelpText("");
    return createAccount();
  };

  const enableTrading = async (remember: boolean) => {
    if (showRefCodeInput) {
      const info = await checkRefCode();
      if (typeof info !== "undefined") {
        setHelpText(info);
        return Promise.reject(-1);
      }
    }
    setHelpText("");
    return createOrderlyKey(remember);
  };

  return {
    enableTrading,
    initAccountState: state.status,
    signIn,
    enableTradingComplted,
    refCode,
    setRefCode,
    helpText,
    showRefCodeInput,
  } as const;
};
