import { usePrivateQuery } from "@orderly.network/hooks";
import { FC, PropsWithChildren, createContext, useEffect, useMemo } from "react";
import { API } from "../types/api";
import { useDaily } from "./useDaily";
import { XAxis, YAxis, BarStyle } from "../components";

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
    //** referral index page */
    showReferralPage?: () => void,
    enterTraderPage?: () => void,
    enterAffiliatePage?: () => void,
    //** tab + tab content */
    showDashboard?: () => void,
    chartConfig?: {
        affiliate: {
            bar?: BarStyle,
            yAxis?: YAxis,
            xAxis?: XAxis,
        },
        trader: {
            bar?: BarStyle,
            yAxis?: YAxis,
            xAxis?: XAxis,
        }
    }
}

export type ReferralContextReturns = {
    referralInfo?: API.ReferralInfo,
    isAffiliate: boolean,
    isTrader: boolean,
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
        showReferralPage,
        enterTraderPage,
        enterAffiliatePage,
        chartConfig,
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
    } = usePrivateQuery<API.UserVolStats>("/v1/volume/user/stats", {

        revalidateOnFocus: true,
    });

    const isAffiliate = (data?.referrer_info?.referral_codes?.length || 0) > 0;
    const isTrader = data?.referee_info.referer_code !== null;


    const userVolume = useMemo(() => {

        const volume: any = {};

        if (dailyVolume && (dailyVolume.length) > 0) {
            volume["1d_volume"] = dailyVolume.reduce((accumulator, currentValue) => {
                return accumulator + currentValue.perp_volume;
            }, 0);
        }

        if (volumeStatistics) {
            volume["7d_volume"] = volumeStatistics.perp_volume_last_7_days;
            volume["30d_volume"] = volumeStatistics.perp_volume_last_30_days;
            volume["all_volume"] = volumeStatistics.perp_volume_ltd;
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

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const refCode = searchParams.get('ref');
        if (refCode) {
            localStorage.setItem("referral_code", refCode);
        }
    }, []);


    return (
        <ReferralContext.Provider value={{
            referralInfo: data,
            isAffiliate: isAffiliate,
            isTrader: isTrader,
            // isAffiliate: false,
            // isTrader: true,
            mutate,
            becomeAnAffiliate,
            becomeAnAffiliateUrl,
            bindReferralCodeState,
            learnAffiliate,
            learnAffiliateUrl,
            referralLinkUrl,
            userVolume,
            dailyVolume,
            showReferralPage,
            enterTraderPage,
            enterAffiliatePage,
            chartConfig,
        }}>
            {props.children}
        </ReferralContext.Provider>
    );
}