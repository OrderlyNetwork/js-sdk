
import { useMediaQuery } from "@orderly.network/hooks";
import { Rebates } from "./sections/rebates";
import { Summary } from "./sections/summary";
import { TraderTitle } from "./sections/traderTitle";
import { MEDIA_LG, MEDIA_XL } from "../types/constants";
import { BarChart } from "./sections/barChart";

export const Trader = () => {
    
    const isXL = useMediaQuery(MEDIA_XL);

    return (<div className="orderly-h-full orderly-text-base-contrast">
           {isXL ? <_SmallLayout /> : <_BigLayout />}
        </div>);
}



const _SmallLayout = () => {
    return (
        <div className="orderly-px-3 orderly-py-4 lg:orderly-px-[60px]">
            <TraderTitle />
            <Summary className="orderly-mt-3"/>
            <BarChart className="orderly-mt-3"/>
            <Rebates className="orderly-mt-3 orderly-sticky orderly-top-6"/>
        </div>
    );

}

const _BigLayout = () => {

    return (
        <div className="orderly-py-4 orderly-px-[60px] orderly-flex orderly-flex-col orderly-items-center orderly-justify-center">

            <div className="orderly-flex orderly- orderly-gap-4 orderly-h-[328px] 2xl:orderly-h-[336px] xl:orderly-w-[904px] 2xl:orderly-w-[1324px]">
                <div className="orderly-w-2/5 orderly-flex orderly-flex-col orderly-gap-4">
                    <TraderTitle/>
                    <Summary className="orderly-flex-1"/>
                </div>
                <BarChart className="orderly-w-3/5 orderly-h-full" />
            </div>

            <Rebates className="orderly-mt-4 xl:orderly-w-[904px] 2xl:orderly-w-[1324px]"/>
        </div>
    );
}