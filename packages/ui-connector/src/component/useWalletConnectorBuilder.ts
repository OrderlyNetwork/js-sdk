import {
  useAccount,
  useCheckReferralCode,
  useGetReferralCode,
  useLazyQuery,
  useMutation,
  useNetworkInfo
} from "@orderly.network/hooks";
import { toast } from "@orderly.network/ui";
import { useEffect, useMemo, useState } from "react";
import { useEventEmitter } from "@orderly.network/hooks";
import { EnumTrackerKeys } from "@orderly.network/types";


export const useWalletConnectorBuilder = () => {
  const { account, state, createOrderlyKey, createAccount } = useAccount();
  const [refCode, setRefCode] = useState("");
  const [helpText, setHelpText] = useState("");
  const { wallet,network} = useNetworkInfo()
  const ee = useEventEmitter();

  const { trigger: verifyRefCode } = useLazyQuery(
    `/v1/public/referral/verify_ref_code?referral_code=${refCode}`
  );

  useEffect(() => {
    const refCode = localStorage.getItem("referral_code");
    if (refCode != null) {
      setRefCode(refCode);
    }
  }, []);

  const { referral_code, isLoading } = useGetReferralCode(account.accountId);

  const [bindRefCode, { error: updateOrderError, isMutating: updateMutating }] =
    useMutation("/v1/referral/bind", "POST");

  useEffect(() => {
    if (refCode.length === 0) {
      setHelpText("");
    }
  }, [refCode]);

  const enableTradingComplted = () => {
    ee.emit(EnumTrackerKeys["signin:success"], {
      wallet,
      network
    });
    toast.success("Wallet connected");
    // validate ref code and bind referral code
    if (refCode.length >= 4 && refCode.length <= 10)
      bindRefCode({ referral_code: refCode }).finally(() => {
        localStorage.removeItem("referral_code");
      });
  };

  const checkRefCode = async (): Promise<string | undefined> => {
    if (refCode.length === 0) return Promise.resolve(undefined);

    if (refCode.length > 0 && (refCode.length < 4 || refCode.length > 10)) {
      return Promise.resolve(
        "The referral_code must be 4 to 10 characters long, only accept upper case roman characters and numbers"
      );
    }

    const { exist } = await verifyRefCode();
    

    if (exist === false) {
      return Promise.resolve("This referral code does not exist.");
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
