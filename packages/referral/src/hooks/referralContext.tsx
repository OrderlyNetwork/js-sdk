import { usePrivateQuery } from "@orderly.network/hooks";
import { FC, PropsWithChildren, createContext, useMemo } from "react";
import { API } from "../types/api";

export type UserVolumeType = {
    "1d_volume"?: number,
    "7d_volume"?: number,
    "30d_volume"?: number,
    "all_volume"?: number,
}

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
    userVolume?: UserVolumeType
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

    const {
        data,
        mutate: referralInfoMutate
    } = usePrivateQuery<API.ReferralInfo>("/v1/referral/info", {
        revalidateOnFocus: true,
    });

    const {
        data: dailyVolume,
        mutate: dailyVolumeMutate
    } = usePrivateQuery<[{
        date: string,
        perp_volume: number
      }]>("/v1/volume/user/daily", {
        revalidateOnFocus: true
    });

    const {
        data: volumeStatistics,
        mutate: volumeStatisticsMutate
    } = usePrivateQuery<API.UserVolStats[]>("/v1/volume/user/stats", {
        revalidateOnFocus: true,
    });

    const isAffiliate = data?.referrer_info?.referral_codes ? data?.referrer_info?.referral_codes.length > 0 : undefined;
    const isTrader = data?.referee_info.referer_code ? data?.referee_info.referer_code !== undefined : undefined;


    const userVolume = useMemo(() => {

        const volume: any = {};

        if ((dailyVolume?.length || 0) > 0) {
            volume["1d_volume"] = dailyVolume?.[0].perp_volume;
        }

        if ((volumeStatistics?.length || 0) > 0) {
            volume["7d_volume"] =  volumeStatistics?.[0].perp_volume_last_7_days;
            volume["30d_volume"] = volumeStatistics?.[0].perp_volume_last_30_days;
            volume["all_volume"] = volumeStatistics?.[0].perp_volume_ltd;
        }

        return volume;

    }, [
        dailyVolume,
        volumeStatistics
    ]);
    

    const mutate = () => {
        volumeStatisticsMutate();
        dailyVolumeMutate();
        referralInfoMutate();
    };


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
            userVolume,
        }}>
            {props.children}
        </ReferralContext.Provider>
    );
}