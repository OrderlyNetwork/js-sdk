import { Divider } from "@/divider";
import { Tooltip } from "@/tooltip";
import { cn } from "@/utils";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";
import { FC } from "react";

export const FreeCollat = () => {
    const isTable = useMediaQuery(MEDIA_TABLET);

    return isTable ? (<MobileFreeCollat />) : (<DesktopFreeCollat title="Free Collat." />);
}

export const MobileFreeCollat = () => {
    return (<span>Free Collat.</span>);
}
export const DesktopFreeCollat: FC<{title?: string, className?: string}> = (props) => {

    return (
        <Tooltip
          content={(<div>
            <span>Free collateral for placing new orders.</span>
            <Divider className="orderly-py-2 orderly-border-white/10"/>
            <span>Free collateral  = Total balance + Total unsettlement PnL - Total position initial margin</span>
          </div>)}
          className="orderly-max-w-[270px]"
        >
          <span className={cn("orderly-text-base-contrast-54 orderly-text-2xs orderly-cursor-pointer", props.className && props.className)}>
            {props.title}
          </span>
        </Tooltip>
    );
}