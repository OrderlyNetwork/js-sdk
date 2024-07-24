import { useMemo } from "react";
import { useQuery } from "../useQuery";

export type CheckReferralCodeReturns = {
  isExist?: boolean;
  error: any;
  isLoading: boolean;
};

export const useCheckReferralCode = (
  code?: string
): CheckReferralCodeReturns => {
  const { data, error, isLoading } = useQuery<{ exist?: boolean }>(
    typeof code === "undefined" || code?.length === 0
      ? null
      : `/v1/public/referral/verify_ref_code?referral_code=${code}`
  );

  if (typeof code === "undefined") {
    return {
      isExist: false,
      error: "The code is undefined",
      isLoading: false,
    };
  }

  return {
    isExist: data?.exist,
    error,
    isLoading,
  };
};
