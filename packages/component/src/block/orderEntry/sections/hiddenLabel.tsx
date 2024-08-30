import { Label } from "@/label";
import { modal } from "@/modal";
import { FC, useCallback, useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";

export const MobileHideenLabel: FC = () => {
  const showHiddenHint = useCallback(() => {
    modal.alert({
      title: "Hidden",
      message: (
        <span className="orderly-text-3xs orderly-text-base-contrast/60">
          Hidden order is a limit order that does not appear in the orderbook.
        </span>
      ),
    });
  }, []);

  return (
    <>
      <Label onClick={showHiddenHint} className="orderly-text-base-contrast-54">
        Hidden
      </Label>
    </>
  );
};

export const DesktopHiddenLabel: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="orderly-text-base-contrast-54 orderly-text-2xs">
            Hidden
          </div>
        </TooltipTrigger>
        <TooltipContent
          align="end"
          alignOffset={-80}
          className="orderly-max-w-[240px] orderly-z-20 orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-p-3 orderly-text-4xs"
        >
          <div>
            <span className="orderly-text-3xs">
              Hidden order is a limit order that does not appear in the
              orderbook.
            </span>
          </div>
          <TooltipArrow className="orderly-fill-base-400" />
        </TooltipContent>
      </Tooltip>
    </>
  );
};
