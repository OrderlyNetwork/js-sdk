import { Label } from "@/label";
import { modal } from "@/modal";
import { FC, useCallback, useState } from "react";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { OrderEntity } from "@orderly.network/types";

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

  return (
    <>
      <Label
        className="orderly-text-base-contrast-54"
        onClick={() => {
          showReduceOnlyHint();
        }}
      >
        Reduce only
      </Label>
    </>
  );
};

export const DesktopReduceOnlyLabel: FC<{
  reduceOnly?: boolean;
  onFieldChange: (name: keyof OrderEntity, value: any) => void;
}> = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="orderly-text-base-contrast-54 orderly-text-2xs"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              props.onFieldChange("reduce_only", !props.reduceOnly);
            }}
          >
            Reduce only
          </button>
        </TooltipTrigger>
        <TooltipContent
          align="center"
          className="orderly-max-w-[300px] orderly-z-20 orderly-text-base-contrast orderly-select-none orderly-rounded orderly-bg-base-400 orderly-p-3 orderly-text-4xs"
        >
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
    </>
  );
};
