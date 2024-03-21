import { useMediaQuery } from "@orderly.network/hooks";
import { CommissionAndReferees } from "./sections/commissionAndReferees";
import { ReferralCode } from "./sections/referralCode";
import { ReferralLink } from "./sections/referralLink";
import { Summary } from "./sections/summary";
import { MEDIA_LG } from "../types/constants";
import { BarChart } from "./sections/barChart";

export const Affiliate = () => {

    const isLG = useMediaQuery(MEDIA_LG);

    return (<div className="orderly-bg-base-900">
           {isLG ? <_SmallLayout /> : <_BigLayout />}
        </div>);

}


const _SmallLayout = () => {
    return (
        <div className="orderly-px-4 orderly-py-4 lg:orderly-px-[60px]">
            <Summary />
            <ReferralLink className="orderly-mt-3"/>
            <ReferralCode className="orderly-mt-3"/>
            <BarChart className="orderly-mt-3"/>
            <CommissionAndReferees className="orderly-mt-3 orderly-sticky orderly-top-6"/>
        </div>
    );

}

const _BigLayout = () => {

    return (
        <div className="orderly-py-4 orderly-px-[60px]">

            <div className="orderly-flex orderly-gap-4 orderly-h-[616px] 2xl:orderly-h-[636px]">
                <div className="orderly-w-2/5 orderly-flex orderly-flex-col orderly-gap-4">
                    <Summary className="orderly-flex-1"/>
                    <BarChart className="orderly-flex-1"/>
                </div>
                <div className="orderly-w-3/5 orderly-flex orderly-flex-col orderly-gap-4">
                    <ReferralLink />
                    <ReferralCode className="orderly-flex-1"/>
                </div>
            </div>

            <CommissionAndReferees className="orderly-mt-4"/>
        </div>
    );
}