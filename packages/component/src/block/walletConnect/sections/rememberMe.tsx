import { InfoIcon } from "@/icon";
// import { modal } from "@/modal";
import { useMediaQuery } from "@orderly.network/hooks";
import { MEDIA_TABLET } from "@orderly.network/types";
import { modal } from "@orderly.network/ui";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

export const RememberMe = () => {

    const isTable = useMediaQuery(MEDIA_TABLET);


    return isTable ? (<MobileRememberMe />) : (<DesktopRememberMe />);

}

export const MobileRememberMe = () => {
    const showRememberHint = () => {
        modal.alert({
            title: "Remember me",
            message: (
                <span className="orderly-text-3xs orderly-text-base-contrast/60">
                    Toggle this option to skip these steps next time you want to trade.
                </span>
            ),
        });
    };

    return (
        <div
            className="orderly-text-base-contrast-54 orderly-text-xs  desktop:orderly-text-base orderly-cursor-pointer"
            onClick={showRememberHint}
        >
            <span>Remember me</span>
            <InfoIcon className="orderly-inline-block orderly-ml-2" size={14} />
        </div>
    );
}

export const DesktopRememberMe = () => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div
                    className="orderly-text-base-contrast-54 orderly-text-xs desktop:orderly-text-base orderly-cursor-pointer"
                >
                    <span>Remember me</span>
                    <InfoIcon className="orderly-inline-block orderly-ml-2" size={14} />
                </div>
            </TooltipTrigger>
            <TooltipContent
                align="center"
                className="orderly-max-w-[300px] orderly-z-20 orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-p-3 orderly-text-4xs"
            >
                <span className="orderly-text-3xs orderly-text-base-contrast/60">
                    Toggle this option to skip these steps next time you want to trade.
                </span>
                <TooltipArrow className="orderly-fill-base-400">

                </TooltipArrow>

            </TooltipContent>
        </Tooltip>
    );
}