import { useAccount, useCheckReferralCode, useGetReferralCode, useMutation } from "@orderly.network/hooks";
import { useMemo, useState } from "react";

export const useWalletConnectorBuilder = () => {
  const { account, state, createOrderlyKey, createAccount } = useAccount();
  const [refCode, setRefCode] = useState("");

  const codeExists = useCheckReferralCode(refCode);

  const {referral_code, isLoading} = useGetReferralCode(account.accountId);

  const [bindRefCode, { error: updateOrderError, isMutating: updateMutating }] =
    useMutation("/v1/referral/bind", "POST");

  const helpText = useMemo(() => {
    if (refCode.length < 4 || refCode.length > 10) {
      return "The referral_code must be 4 to 10 characters long, only accept upper case roman characters and numbers"
    }
    if (codeExists.isLoading) return "";
    return codeExists.isExist ? "" : "This referral code does not exist.";
  }, [codeExists, refCode]);

  const enableTradingComplted = () => {
    // validate ref code and bind referral code
    if (refCode.length >= 4 && refCode.length <= 10)
      bindRefCode({referral_code: refCode});
  };
  return {
    enableTrading: createOrderlyKey,
    initAccountState: state.status,
    signIn: createAccount,
    enableTradingComplted,
    refCode,
    setRefCode,
    helpText,
    showRefCodeInput: (referral_code?.length || 0) === 0 && !isLoading
  } as const;
};
