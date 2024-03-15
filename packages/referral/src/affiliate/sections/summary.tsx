import { FC, useContext, useMemo, useState } from "react";
import { HistoryIcon } from "../../components/icons/history";
import { TriangleDownIcon } from "../../components/icons/triangleDown";
import { USDCIcon } from "../../components/icons/usdc";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Numeral, cn } from "@orderly.network/react";
import { ReferralContext } from "../../hooks/referralContext";
import { SummaryFilter } from "./summaryFilter";

export type FilterType = "All" | "1D" | "7D" | "30D";
export const Summary: FC<{ className?: string }> = (props) => {

    const [filterType, setFiltetType] = useState<FilterType>("All");
    const { referralInfo } = useContext(ReferralContext);

    const commission = useMemo(() => {
        if (!referralInfo) return 0;
        // 
        switch (filterType) {
            case "All": return referralInfo.referrer_info.total_traded;
            case "1D":  return referralInfo.referrer_info["1d_referrer_rebate"];
            case "7D":  return referralInfo.referrer_info["7d_referrer_rebate"];
            case "30D": return referralInfo.referrer_info["30d_referrer_rebate"];
        }
    }, [referralInfo, filterType]);

    const referralVol = useMemo(() => {
        if (!referralInfo) return 0;
        switch (filterType) {
            case "All": return referralInfo.referrer_info.total_referee_volume;
            case "1D":  return referralInfo.referrer_info["1d_referee_volume"];
            case "7D":  return referralInfo.referrer_info["7d_referee_volume"];
            case "30D": return referralInfo.referrer_info["30d_referee_volume"];
        }
    }, [referralInfo, , filterType]);
    const referees = useMemo(() => {
        if (!referralInfo) return 0;
        switch (filterType) {
            case "All": return referralInfo.referrer_info.total_referee_fee;
            case "1D":  return referralInfo.referrer_info["1d_referee_fee"];
            case "7D":  return referralInfo.referrer_info["7d_referee_fee"];
            case "30D": return referralInfo.referrer_info["30d_referee_fee"];
        }
    }, [referralInfo, , filterType]);

    const refereesTades = useMemo(() => {
        if (!referralInfo) return 0;
        switch (filterType) {
            case "All": return referralInfo.referrer_info.total_traded;
            case "1D":  return referralInfo.referrer_info["1d_traded"];
            case "7D":  return referralInfo.referrer_info["7d_traded"];
            case "30D": return referralInfo.referrer_info["30d_traded"];
        }
    }, [referralInfo, , filterType]);

    return (
        <div className={cn("orderly-p-6 orderly-bg-base-600 orderly-rounded-lg", props.className)}>
            <div className="orderly-flex orderly-justify-between">
                <span className="orderly-text-base 2xl:orderly-text-lg">Summary</span>


                <SummaryFilter curType={filterType} onClick={setFiltetType} />
            </div>

            <div className="orderly-mt-4 orderly-p-6 orderly-rounded-lg orderly-bg-gradient-to-t orderly-to-[rgba(41,137,226,1)] orderly-from-[rgba(39,43,147,1)]">
                <div className="orderly-text-center orderly-text-xs md:orderly-text-base lg:orderly-text-base xl:orderly-text-base 2xl:orderly-text-lg orderly-text-base-contrast-54">Commission (USDC)</div>
                <div className="orderly-flex orderly-justify-center orderly-items-center orderly-mt-3">
                    <USDCIcon />
                    <Numeral className="orderly-ml-2 orderly-text-[22px] md:orderly-text-[24px] lg:orderly-text-[28px] xl:orderly-text-[28px] 2xl:orderly-text-[32px]">
                        {commission}
                    </Numeral>
                </div>
            </div>

            <div className="orderly-mt-2">
                <Item title="Referral vol. (USDC)" value={referralVol} />
                <Item title="Referees" value={referees} />
                <Item title="Referees that traded" value={refereesTades} />
            </div>
        </div>
    );
}


const Item: FC<{ title: string, value: any }> = (props) => {
    const { title, value } = props;

    return (
        <div className="orderly-flex orderly-justify-between orderly-items-center orderly-mt-2">
            <div className="orderly-text-base-contrast-54 orderly-text-2xs 2xl:orderly-text-xs">
                {title}
            </div>

            <Numeral className="orderly-text-2xs md:orderly-text-xs lg:orderly-text-xs xl:orderly-text-xs 2xl:orderly-text-base">{value}</Numeral>
        </div>
    );
};