import { Button, cn } from "@orderly.network/react"
import { FC, useContext } from "react";
import { GradientText } from "../../components/gradientText";
import { ReferralContext } from "../../hooks/referralContext";

export const TraderTitle: FC<{
    className?: string,
}> = (props) => {

    const { referralInfo } = useContext(ReferralContext);
    
    const code = referralInfo?.referee_info.referer_code;
    const rebate = referralInfo?.referee_info.referee_rebate_rate;
    if (!code) {
        return <div></div>
    }


    return (
        <div className={cn("orderly-flex orderly-justify-between", props.className)}>
            <div className="orderly-flex orderly-items-center">
                <div className="orderly-text-xs md:orderly-text-base 2xl:orderly-text-lg">Your referral</div>
                <Button color={"tertiary"} className="orderly-ml-3 orderly-py-2 orderly-px-[10px] orderly-h-[32px] orderly-text-primary">{code || "-"}</Button>
            </div>
            <div className="orderly-flex orderly-items-center">
                <div className="orderly-text-xs md:orderly-text-base 2xl:orderly-text-lg orderly-text-base-contrast-54">Rebate:</div>
                <div className="orderly-text-lg md:orderly-text-xl lg:orderly-text-[24px] 2xl:orderly-text-[26px] orderly-text-primary orderly-ml-3">
                    <GradientText texts={[
                        {text: `${rebate || "-"}`, gradient: true}
                    ]} />
                </div>
            </div>
        </div>
    );
}