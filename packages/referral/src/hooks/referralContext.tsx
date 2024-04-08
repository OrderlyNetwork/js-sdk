import { usePrivateQuery } from "@orderly.network/hooks";
import { FC, PropsWithChildren, createContext, useEffect, useMemo } from "react";
import { API } from "../types/api";
import { useDaily } from "./useDaily";
import { XAxis, YAxis, BarStyle } from "../components";
import { formatYMDTime } from "../utils/utils";

export type UserVolumeType = {
    "1d_volume"?: number,
    "7d_volume"?: number,
    "30d_volume"?: number,
    "all_volume"?: number,
}



export type ReferralContextProps = {
    becomeAnAffiliate?: () => void,
    becomeAnAffiliateUrl?: string,
    bindReferralCodeState?: (success: boolean, error: any, hide: any, queryParams: any) => void,
    learnAffiliate?: () => void,
    learnAffiliateUrl?: string,
    referralLinkUrl: string,
    //** referral index page */
    showReferralPage?: () => void,
    enterTraderPage?: (params?: {}) => void,
    enterAffiliatePage?: (params?: {}) => void,
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
    
    const isAffiliate = useMemo(() => {
        return (data?.referrer_info?.referral_codes?.length || 0) > 0;
    }, [data?.referrer_info]);

    const isTrader = useMemo(() => {
        return (data?.referee_info.referer_code?.length || 0) > 0;
    }, [data?.referee_info]);


    const userVolume = useMemo(() => {

        const volume: any = {};

        if (dailyVolume && (dailyVolume.length) > 0) {
            const now = formatYMDTime(new Date().toLocaleDateString());
            const index = dailyVolume.findIndex((item) => {
                const itemDate = item.date;
                return itemDate === now;
            });
            let oneDayVolume = 0;
            if (index !== -1) {
                oneDayVolume = dailyVolume[index].perp_volume;
            }
            volume["1d_volume"] = oneDayVolume;
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
            // isAffiliate: true,
            // isTrader: false,
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