import { Label } from "@/label";
import { modal } from "@/modal";
import { FC, useCallback, useState } from "react";
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from "@radix-ui/react-tooltip";

export const MobileReduceOnlyLabel: FC = () => {
    const showReduceOnlyHint = useCallback(() => {
      modal.alert({
        title: "Reduce only",
        message: (
          <span className="orderly-text-2xs orderly-text-base-contrast-54">
            Reduce only ensures that you can only reduce or close a current
            position so that your position size will not be increased
            unintentionally.
          </span>
        ),
      });
    }, []);
  
    return (<>
      <Label
        className="orderly-text-base-contrast-54"
        onClick={() => {
          showReduceOnlyHint();
        }}
      >
        Reduce only
      </Label>
    </>);
  }
  
  export const DesktopReduceOnlyLabel: FC = () => {
    const [open, setOpen] = useState(false);
  
    return (<>
      <Tooltip>
        <TooltipTrigger>
          <Label
            className="orderly-text-base-contrast-54 desktop:orderly-underline"
          >
            Reduce only
          </Label>
        </TooltipTrigger>
        <TooltipContent
          align="center"
          className="orderly-max-w-[276px] data-[state=delayed-open]:data-[side=top]:orderly-animate-slideDownAndFade data-[state=delayed-open]:data-[side=right]:orderly-animate-slideLeftAndFade data-[state=delayed-open]:data-[side=left]:orderly-animate-slideRightAndFade data-[state=delayed-open]:data-[side=bottom]:orderly-animate-slideUpAndFade orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-px-[15px] orderly-py-[10px] orderly-text-3xs orderly-leading-none orderly-shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] orderly-will-change-[transform,opacity]">
          <div>
            <span className="orderly-text-3xs">
              Reduce only ensures that you can only reduce or close a current
              position so that your position size will not be increased
              unintentionally.
            </span>
          </div>
          <TooltipArrow className="orderly-fill-base-400" />
        </TooltipContent>
      </Tooltip>
    </>);
  };