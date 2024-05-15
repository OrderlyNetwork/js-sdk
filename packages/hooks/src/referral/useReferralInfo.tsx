import { useCallback, useMemo } from "react";
import { useQuery } from "../useQuery";
import { usePrivateQuery } from "../usePrivateQuery";
import { RefferalAPI } from "./api";
import { useLocalStorage } from "../useLocalStorage";

export const useReferralInfo = ():{
  data?: RefferalAPI.ReferralInfo;
  isTrader?: boolean;
  isAffiliate?: boolean;
  error: any;
  isLoading: boolean;
  getFirstRefCode: () => RefferalAPI.ReferralCode | undefined;
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


  const [pinCodes] = useLocalStorage<string[]>("orderly_referral_codes", [] as string[]);

  const getFirstRefCode = useCallback(() : RefferalAPI.ReferralCode | undefined => {

    if (!data?.referrer_info.referral_codes) return undefined;
    const referralCodes = [...data?.referrer_info.referral_codes];

    const pinedItems: RefferalAPI.ReferralCode[] = [];

    for (let i = 0; i < pinCodes.length; i++) {
        const code = pinCodes[i];

        const index = referralCodes.findIndex((item) => item.code === code);
        if (index !== -1) {

            pinedItems.push({ ...referralCodes[index]});
            referralCodes.splice(index, 1);
        }

    }

    const newCodes = [...pinedItems, ...referralCodes];

    return newCodes?.[0];
  }, [pinCodes, data]);
  

  return {
    data,
    isTrader,
    isAffiliate,
    error,
    isLoading,
    getFirstRefCode,
  };
};
