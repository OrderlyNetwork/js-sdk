import { FC, useMemo } from "react";
import { PnLDisplayFormat } from "../type";
import { cn } from "@/utils";
import { Circle } from "lucide-react";

export const PnlFormatView: FC<{
    type: PnLDisplayFormat;
    curType?: PnLDisplayFormat;
    setPnlFormat: any;
  }> = (props) => {
    const { type, curType, setPnlFormat } = props;
  
    const text = useMemo(() => {
      switch (type) {
        case "roi_pnl":
          return "ROI & PnL";
        case "roi":
          return "ROI";
        case "pnl":
          return "PnL";
      }
    }, [type]);
  
    const isSelected = type === curType;
  
    let clsName =
      "orderly-flex orderly-items-center orderly-gap-1 orderly-cursor-pointer";
    if (isSelected) {
      clsName += " orderly-text-base-contrast";
    } else {
      clsName += "";
    }
  
    return (
      <div
        className={clsName}
        onClick={() => {
          setPnlFormat(type);
        }}
      >
        <button
          type="button"
          className="orderly-order-entry-radio-button orderly-w-[14px] orderly-h-[14px] orderly-rounded-full orderly-border-2 orderly-border-base-contrast-20"
        >
          {isSelected && (
            // @ts-ignore
            <Circle className="orderly-order-entry-radio-circle orderly-w-[10px] orderly-h-[10px] orderly-text-link orderly-bg-link orderly-rounded-full" />
          )}
        </button>
        <span
          className={cn(
            "orderly-text-[16px] orderly-ml-2 orderly-text-base-contrast-54",
            isSelected && "orderly-text-base-contrast"
          )}
        >
          {text}
        </span>
      </div>
    );
  };