import { useMemo } from "react";
import { useQuery } from "../useQuery";
import { usePrivateQuery } from "../usePrivateQuery";
import { RefferalAPI } from "./api";

export const useReferralInfo = ():{
  data?: RefferalAPI.ReferralInfo;
  isTrader?: boolean;
  isAffiliate?: boolean;
  error: any;
  isLoading: boolean;
} => {
  const {
    data,
    mutate,
    isLoading,
    error,
  } = usePrivateQuery<RefferalAPI.ReferralInfo>("/v1/referral/info", {
    revalidateOnFocus: true,
  });

  const isTrader = useMemo(() => {
    if (typeof data?.referee_info?.referer_code === 'undefined') return undefined;
    return (data?.referee_info?.referer_code?.length || 0) > 0;
  }, [data?.referee_info]);
  
  const isAffiliate = useMemo(() => {
    if (typeof data?.referrer_info?.referral_codes === 'undefined') return undefined;
    return (data?.referrer_info?.referral_codes?.length || 0) > 0;
  }, [data?.referrer_info]);
  

  return {
    data,
    isTrader,
    isAffiliate,
    error,
    isLoading,
  };
};
