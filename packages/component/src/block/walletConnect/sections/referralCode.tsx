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

    const { saveRefCode } = useContext(OrderlyContext);

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (saveRefCode && inputRef) {

            inputRef?.current?.focus();
            inputRef?.current?.setSelectionRange(inputRef?.current.value.length, inputRef.current.value.length);

        }
    }, [saveRefCode, refCode, inputRef])

    console.log("xxxxxxxxxxxx saveRefCode", saveRefCode);



    if (!saveRefCode) return <></>;

    return (
        <div className={cn("orderly-text-2xs orderly-text-base-contrast-80", props.className)}>
            <div>Referral code (optional)</div>
            <div className="orderly-pt-3">
                <Input
                    ref={inputRef}
                    containerClassName="orderly-h-[40px] orderly-bg-base-900"
                    value={refCode}
                    onChange={(e) => setRefCode(e.target.value)}
                    autoFocus
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