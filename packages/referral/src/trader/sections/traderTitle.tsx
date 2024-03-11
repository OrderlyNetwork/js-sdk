import { Button, cn } from "@orderly.network/react"
import { FC } from "react";

export const TraderTitle: FC<{
    className?: string,
}> = (props) => {

    return (
        <div className={cn("orderly-flex orderly-justify-between", props.className)}>
            <div className="orderly-flex orderly-items-center">
                <div className="orderly-txt-xs md:orderly-text-base 2xl:orderly-text-lg">Your referral</div>
                <Button color={"tertiary"} className="orderly-ml-3 orderly-text-primary">Carbo-9527</Button>
            </div>
            <div className="orderly-flex orderly-items-center">
                <div className="orderly-text-xs md:orderly-text-base 2xl:orderly-text-lg orderly-text-base-contrast-54">Rebate</div>
                <div className="orderly-text-lg md:orderly-text-xl lg:orderly-text-[24px] 2xl:orderly-text-[26px] orderly-text-primary orderly-ml-3">20%</div>
            </div>
        </div>
    );
}