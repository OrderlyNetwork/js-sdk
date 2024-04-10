import React, { useContext, useMemo, useState } from "react";
import { FC } from "react";
import { Numeral, cn } from "@orderly.network/react";
import { HistoryIcon, TriangleDownIcon, USDCIcon } from "../../affiliate/icons";
import { FilterType } from "../../types/types";
import { ReferralContext } from "../../hooks/referralContext";
import { SummaryFilter } from "../../components/summaryFilter";

export const Summary: FC<{className?: string}> = (props) => {
    const [filterType, setFiltetType] = useState<FilterType>("All");
    const { referralInfo, userVolume } = useContext(ReferralContext);

    console.log("referralInfo.referee_info", referralInfo?.referee_info, "vol", userVolume);
    

    const rebates = useMemo(() => {
        if (!referralInfo) return 0;
        // 
        switch (filterType) {
            case "All": return referralInfo.referee_info.total_referee_rebate
            case "1D":  return referralInfo.referee_info["1d_referee_rebate"];
            case "7D":  return referralInfo.referee_info["7d_referee_rebate"];
            case "30D": return referralInfo.referee_info["30d_referee_rebate"];
        }
    }, [referralInfo, filterType]);

    const vol = useMemo(() => {
        if (!userVolume) return undefined;
        switch (filterType) {
            case "All": return userVolume.all_volume;
            case "1D":  return userVolume["1d_volume"];
            case "7D":  return userVolume["7d_volume"];
            case "30D": return userVolume["30d_volume"];
        }
    }, [userVolume, filterType]);
    

    return (
        <div className={cn("orderly-p-6 orderly-flex orderly-flex-col orderly-bg-base-600 orderly-rounded-xl orderly-outline orderly-outline-1 orderly-outline-base-contrast-12", props.className)}>
            <div className="orderly-flex orderly-justify-between">
                <span className="orderly-text-base 2xl:orderly-text-lg">Summary</span>
                <SummaryFilter curType={filterType} onClick={setFiltetType} />
            </div>

            <div className="orderly-my-4 orderly-p-6 orderly-rounded-xl orderly-bg-[#00685C] orderly-flex-grow">
                <div className="orderly-text-center orderly-text-xs md:orderly-text-base lg:orderly-text-base xl:orderly-text-base 2xl:orderly-text-lg orderly-text-base-contrast-80">Rebates (USDC)</div>
                <div className="orderly-flex orderly-justify-center orderly-items-center orderly-mt-3">
                    <USDCIcon size={28} />
                    <Numeral className="orderly-ml-2 orderly-text-[22px] md:orderly-text-[24px] lg:orderly-text-[28px] xl:orderly-text-[28px] 2xl:orderly-text-[32px]">
                        {rebates}
                    </Numeral>
                </div>
            </div>

            <div >
                <Item title="Trading vol. (USDC)" value={vol} className="orderly-mt-0"/>
            </div>
        </div>
    );
}


const Item: FC<{title: string, value: any, className?: string}> = (props) => {
    const { title, value, className } = props;

    return (
        <div className={cn("orderly-flex orderly-justify-between orderly-items-center orderly-mt-2", className)}>
            <div className="orderly-text-base-contrast-54 orderly-text-2xs 2xl:orderly-text-xs">
                {title}
            </div>

            <Numeral className="orderly-text-2xs md:orderly-text-xs lg:orderly-text-xs xl:orderly-text-xs 2xl:orderly-text-base">{value || 0}</Numeral>
        </div>
    );
};