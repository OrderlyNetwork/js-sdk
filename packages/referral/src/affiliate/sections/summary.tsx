import { FC, useContext, useMemo, useState } from "react";
import { HistoryIcon } from "../../components/icons/history";
import { TriangleDownIcon } from "../../components/icons/triangleDown";
import { USDCIcon } from "../../components/icons/usdc";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, Numeral, cn } from "@orderly.network/react";
import { ReferralContext } from "../../hooks/referralContext";
import { SummaryFilter } from "../../components/summaryFilter";
import { FilterType } from "../../types/types";
import { refCommify } from "../../utils/decimal";


export const Summary: FC<{ className?: string }> = (props) => {

    const [filterType, setFiltetType] = useState<FilterType>("All");
    const { referralInfo } = useContext(ReferralContext);

    const commission = useMemo(() => {
        if (!referralInfo) return 0;
        // 
        switch (filterType) {
            case "All": return referralInfo.referrer_info.total_referrer_rebate;
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
            case "All": return referralInfo.referrer_info.total_invites;
            case "1D":  return referralInfo.referrer_info["1d_invites"];
            case "7D":  return referralInfo.referrer_info["7d_invites"];
            case "30D": return referralInfo.referrer_info["30d_invites"];
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
        <div className={cn("orderly-p-6 orderly-flex orderly-flex-col orderly-bg-base-600 orderly-rounded-xl orderly-outline orderly-outline-1 orderly-outline-base-contrast-12", props.className)}>
            <div className="orderly-flex orderly-justify-between">
                <span className="orderly-text-base 2xl:orderly-text-lg">Summary</span>
                <SummaryFilter curType={filterType} onClick={setFiltetType} />
            </div>

            <div className="orderly-my-4 orderly-p-6 orderly-rounded-xl orderly-bg-gradient-to-t orderly-from-referral-bg-from orderly-to-referral-bg-to orderly-flex-grow">
                <div className="orderly-text-center orderly-text-xs md:orderly-text-base lg:orderly-text-base xl:orderly-text-base 2xl:orderly-text-lg orderly-text-base-contrast-54">Commission (USDC)</div>
                <div className="orderly-flex orderly-justify-center orderly-items-center orderly-mt-3">
                    <USDCIcon />
                    <Numeral className="orderly-ml-2 orderly-text-[22px] md:orderly-text-[24px] lg:orderly-text-[28px] xl:orderly-text-[28px] 2xl:orderly-text-[32px]">
                        {commission}
                    </Numeral>
                </div>
            </div>

            <div>
                <Item title="Referral vol. (USDC)" value={referralVol} className="orderly-mt-0" />
                <Item title="Referees" value={referees} />
                <Item title="Referees that traded" value={refereesTades} />
            </div>
        </div>
    );
}


const Item: FC<{ title: string, value: any, className?: string }> = (props) => {
    const { title, value, className } = props;

    return (
        <div className={cn("orderly-flex orderly-justify-between orderly-items-center orderly-mt-2", className)}>
            <div className="orderly-text-base-contrast-54 orderly-text-2xs 2xl:orderly-text-xs">
                {title}
            </div>

            <div className="orderly-text-2xs md:orderly-text-xs lg:orderly-text-xs xl:orderly-text-xs 2xl:orderly-text-base">{refCommify(value,2)}</div>
        </div>
    );
};