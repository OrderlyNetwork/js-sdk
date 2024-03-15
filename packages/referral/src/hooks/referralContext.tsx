import { usePrivateQuery } from "@orderly.network/hooks";
import { FC, PropsWithChildren, createContext } from "react";
import { API } from "../types/api";

export type ReferralContextProps = {
    becomeAnAffiliate?: () => void,
    becomeAnAffiliateUrl?: string,
    bindReferralCodeState?: (success: boolean, error: any, hide: any) => void,
    learnAffiliate?: () => void,
    learnAffiliateUrl?: string,
    referralLinkUrl: string,
}

export type ReferralContextReturns = {
    referralInfo?: API.ReferralInfo,
    isAffiliate?: boolean,
    isTrader?: boolean,
    mutate: any,
} & ReferralContextProps;

export const ReferralContext = createContext<ReferralContextReturns>({} as ReferralContextReturns);

export const ReferralProvider: FC<PropsWithChildren<ReferralContextProps>> = (props) => {
    const {
        becomeAnAffiliate,
        becomeAnAffiliateUrl,
        bindReferralCodeState,
        learnAffiliate,
        learnAffiliateUrl,
        referralLinkUrl,
    } = props;

    const { data, mutate } = usePrivateQuery<API.ReferralInfo>("/v1/referral/info", {
        revalidateOnFocus: true,
    });

    const isAffiliate = data?.referrer_info?.referral_codes ? data?.referrer_info?.referral_codes.length > 0 : undefined;
    const isTrader = data?.referee_info.referer_code ? data?.referee_info.referer_code !== undefined : undefined;

    console.log("mutate is", mutate);


    return (
        <ReferralContext.Provider value={{
            referralInfo: data,
            isAffiliate: isAffiliate,
            isTrader: isTrader,
            mutate,
            becomeAnAffiliate,
            becomeAnAffiliateUrl,
            bindReferralCodeState,
            learnAffiliate,
            learnAffiliateUrl,
            referralLinkUrl,
        }}>
            {props.children}
        </ReferralContext.Provider>
    );
}