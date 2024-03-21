
import { useMediaQuery } from "@orderly.network/hooks";
import { Rebates } from "./sections/rebates";
import { Summary } from "./sections/summary";
import { TraderTitle } from "./sections/traderTitle";
import { MEDIA_LG } from "../types/constants";
import { BarChart } from "./sections/barChart";

export const Trader = () => {
    
    const isLG = useMediaQuery(MEDIA_LG);

    return (<div className="orderly-bg-base-900">
           {isLG ? <_SmallLayout /> : <_BigLayout />}
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
        <div className="orderly-py-4 orderly-px-[60px]">

            <div className="orderly-flex orderly-gap-4 orderly-h-[328px] 2xl:orderly-h-[336px]">
                <div className="orderly-w-2/5 orderly-flex orderly-flex-col orderly-gap-4">
                    <TraderTitle/>
                    <Summary className="orderly-flex-1"/>
                </div>
                {/* <div className="orderly-w-3/5 orderly-flex orderly-flex-col orderly-gap-4">
                    <BarChart className="orderly-flex-1"/>
                </div> */}

                <BarChart className="orderly-flex-1 orderly-h-full" />
            </div>

            <Rebates className="orderly-mt-4"/>
        </div>
    );
}