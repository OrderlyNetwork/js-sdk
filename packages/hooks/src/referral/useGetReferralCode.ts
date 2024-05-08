import { useMemo } from "react";
import { useQuery } from "../useQuery";

export const useGetReferralCode = (
    accountId?: string
):{
    referral_code?: string;
    error: any;
    isLoading: boolean;
  } => {
  if (typeof accountId === "undefined" || accountId.length === 0) {
    return {
      referral_code: undefined,
        error: "The account id is empty or undefined",
        isLoading: false,
    };
  }
  const { data, error, isLoading } = useQuery<{referral_code?: string}>(
    `/v1/public/referral/check_ref_code?account_id=${accountId}`
  );
  

  return {
    referral_code: data?.referral_code,
    error,
    isLoading,
  };
};
