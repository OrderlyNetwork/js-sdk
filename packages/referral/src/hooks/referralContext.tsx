import { usePrivateQuery } from "@orderly.network/hooks";
import { FC, PropsWithChildren, createContext } from "react";

export type ReferralContextProps = {
    isAffilate?: boolean,
    isTrader?: boolean,
}

export const ReferralContext = createContext<ReferralContextProps>({} as ReferralContextProps);

export const ReferralProvider: FC<PropsWithChildren> = (props) => {

    const { data, error } = usePrivateQuery<any>("/v1/referral/info");

    const isAffiliate = data?.referrer_info?.referral_codes ? data?.referrer_info?.referral_codes !== undefined : undefined;
    const isTrader = data?.referee_info.referer_code ? data?.referee_info.referer_code !== undefined : undefined;

    return (
        <ReferralContext.Provider value={{
            isAffilate: isAffiliate,
            isTrader: isTrader,
        }}>
            {props.children}
        </ReferralContext.Provider>
    );
}