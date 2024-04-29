import { useMemo } from "react";
import { useQuery } from "../useQuery";

export const useCheckReferralCode = (
  code?: string
):{
    isExist?: boolean;
    error: any;
    isLoading: boolean;
  } => {
  if (typeof code === "undefined") {
    return {
        isExist: false,
        error: "The code is empty",
        isLoading: false,
    };
  }
  const { data, error, isLoading } = useQuery<{exist?: boolean}>(
    `/v1/public/referral/verify_ref_code?referral_code=${code}`
  );
  

  return {
    isExist: data?.exist,
    error,
    isLoading,
  };
};
