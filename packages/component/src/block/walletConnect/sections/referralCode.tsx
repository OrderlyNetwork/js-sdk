import { CircleCloseIcon } from "@/icon";
import { Input } from "@/input";
import { OrderlyAppContext } from "@/provider";
import { cn } from "@/utils";
import { OrderlyContext, useLocalStorage } from "@orderly.network/hooks";
import { FC, useContext, useEffect, useRef, useState } from "react";

export const ReferralCode: FC<{
    className?: string,
    refCode?: string,
    setRefCode: any,
}> = (props) => {

    const { className, refCode, setRefCode } = props;

    const { referral } = useContext(OrderlyAppContext);

    const localRefCode = localStorage.getItem("referral_code");

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (referral?.saveRefCode === true && inputRef) {

            inputRef?.current?.focus();
            inputRef?.current?.setSelectionRange(inputRef?.current.value.length, inputRef.current.value.length);

        }
    }, [referral?.saveRefCode, refCode, inputRef])


    if (referral?.saveRefCode !== true || ((localRefCode?.length || 0) <= 0)) return <></>;

    return (
        <div className={cn("orderly-text-2xs orderly-text-base-contrast-80", props.className)}>
            <div>Referral code (optional)</div>
            <div className="orderly-pt-3">
                <Input
                    ref={inputRef}
                    containerClassName="orderly-h-[40px] orderly-bg-base-700"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    autoFocus
                    suffix={<button className="orderly-mr-2" onClick={(e) => {
                        e.stopPropagation();
                        setRefCode("");
                    }}>
                        <CircleCloseIcon size={18} fillOpacity={1} className="orderly-fill-base-contrast-20 hover:orderly-fill-base-contrast-54" />
                    </button>}
                />
            </div>
        </div>
    );
}