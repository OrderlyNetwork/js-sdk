import { CircleCloseIcon } from "@/icon";
import { Input } from "@/input";
import { OrderlyAppContext } from "@/provider";
import { cn } from "@/utils";
import { OrderlyContext, useLocalStorage } from "@orderly.network/hooks";
import { FC, useContext, useState } from "react";

export const ReferralCode: FC<{
    className?: string,
    refCode?: string,
    setRefCode: any,
}> = (props) => {

    const { className, refCode ,setRefCode } = props;

    const { saveRefCode } = useContext(OrderlyContext);

    console.log("xxxxxxxxxxxx saveRefCode", saveRefCode);
    


    if (!refCode || !saveRefCode) return <></>;

    return (
        <div className={cn("orderly-text-2xs orderly-text-base-contrast-80", props.className)}>
            <div>Referral code (optional)</div>
            <div className="orderly-pt-3">
                <Input
                    containerClassName="orderly-h-[40px] orderly-bg-base-900"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    suffix={<button className="orderly-mr-2" onClick={(e) => {
                        e.stopPropagation();
                        setRefCode("");
                    }}>
                        <CircleCloseIcon size={18} />
                    </button>}
                />
            </div>
        </div>
    );
}