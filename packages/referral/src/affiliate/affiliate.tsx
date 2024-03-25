import { useMediaQuery } from "@orderly.network/hooks";
import { CommissionAndReferees } from "./sections/commissionAndReferees";
import { ReferralCode } from "./sections/referralCode";
import { ReferralLink } from "./sections/referralLink";
import { Summary } from "./sections/summary";
import { MEDIA_LG, MEDIA_XL } from "../types/constants";
import { BarChart } from "./sections/barChart";

export const Affiliate = () => {

    const isXL = useMediaQuery(MEDIA_XL);

    return (<div className="orderly-h-full">
           {isXL ? <_SmallLayout /> : <_BigLayout />}
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
        <div className="orderly-py-4 orderly-px-[60px] orderly-flex orderly-flex-col orderly-items-center orderly-justify-center">

            <div className="orderly-flex orderly-gap-4 orderly-h-[616px] 2xl:orderly-h-[636px] xl:orderly-w-[904px] 2xl:orderly-w-[1324px]">
                <div className="orderly-w-1/3 orderly-flex orderly-flex-col orderly-gap-4">
                    <Summary className="orderly-flex-1"/>
                    <BarChart className="orderly-flex-1"/>
                </div>
                <div className="orderly-flex-1 orderly-flex orderly-flex-col orderly-gap-4">
                    <ReferralLink />
                    <ReferralCode className="orderly-flex-1"/>
                </div>
            </div>

            <CommissionAndReferees className="orderly-mt-4 xl:orderly-w-[904px] 2xl:orderly-w-[1324px]"/>
        </div>
    );
}