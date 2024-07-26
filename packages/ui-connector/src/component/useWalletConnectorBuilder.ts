import {
  useAccount,
  useCheckReferralCode,
  useGetReferralCode,
  useMutation,
} from "@orderly.network/hooks";
import { useEffect, useMemo, useState } from "react";

export const useWalletConnectorBuilder = () => {
  const { account, state, createOrderlyKey, createAccount } = useAccount();
  const [refCode, setRefCode] = useState("");
  const [helpText, setHelpText] = useState("");

  const [verifyRefCode] = useMutation(
    "/v1/public/referral/verify_ref_code",
    "GET"
  );

  const { referral_code, isLoading } = useGetReferralCode(account.accountId);

  const [bindRefCode, { error: updateOrderError, isMutating: updateMutating }] =
    useMutation("/v1/referral/bind", "POST", {
      // disableSignature: true,
    });

  useEffect(() => {
    if (refCode.length === 0) {
      setHelpText("");
    }
  }, [refCode]);

  const enableTradingComplted = () => {
    // validate ref code and bind referral code
    if (refCode.length >= 4 && refCode.length <= 10)
      bindRefCode({ referral_code: refCode });
  };

  const checkRefCode = async (): Promise<string | undefined> => {
    if (refCode.length === 0) return Promise.resolve(undefined);

    if (refCode.length > 0 && (refCode.length < 4 || refCode.length > 10)) {
      return Promise.resolve(
        "The referral_code must be 4 to 10 characters long, only accept upper case roman characters and numbers"
      );
    }
    
    const res = await verifyRefCode(null, { referral_code: refCode });

    if (res?.success) {
      if (res.data?.exist === false) {
        return Promise.resolve("This referral code does not exist.");
      }
      return Promise.resolve(undefined);
    }
    return Promise.resolve("");
  };

  const signIn = async () => {
    const info = await checkRefCode();
    if (typeof info !== "undefined") {
      setHelpText(info);
      return;
    }
    return createAccount();
  };

  const enableTrading = async (remember: boolean) => {
    const info = await checkRefCode();
    if (typeof info !== "undefined") {
      setHelpText(info);
      return Promise.reject();
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
    showRefCodeInput: (referral_code?.length || 0) === 0 && !isLoading,
  } as const;
};
