import { usePrivateQuery } from "@orderly.network/hooks";
import { FC, PropsWithChildren, createContext, useMemo } from "react";
import { API } from "../types/api";
import { useDaily } from "./useDaily";

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
    dailyVolume?: API.DayliVolume[],
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
    } = useDaily();

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

        if (dailyVolume && (dailyVolume.length) > 0) {
            volume["1d_volume"] = dailyVolume.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.perp_volume;
            }, 0);
        }

        if (volumeStatistics && (volumeStatistics.length) > 0) {

            const sum = volumeStatistics.reduce((accumulator, currentValue) => {
                accumulator["perp_volume_last_30_days"] = currentValue["perp_volume_last_30_days"];
                accumulator["perp_volume_last_7_days"] = currentValue["perp_volume_last_7_days"];
                accumulator["perp_volume_ltd"] = currentValue["perp_volume_ltd"];
                accumulator["perp_volume_ytd"] = currentValue["perp_volume_ytd"];
                return accumulator;
            }, {
                "perp_volume_last_30_days": 0,
                "perp_volume_last_7_days": 0,
                "perp_volume_ltd": 0,
                "perp_volume_ytd": 0
            } as API.UserVolStats);

            volume["7d_volume"] = sum.perp_volume_last_7_days;
            volume["30d_volume"] = sum.perp_volume_last_30_days;
            volume["all_volume"] = sum.perp_volume_ltd;
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
            dailyVolume,
        }}>
            {props.children}
        </ReferralContext.Provider>
    );
}