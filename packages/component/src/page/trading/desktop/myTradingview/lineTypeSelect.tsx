import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import { Tooltip } from "@/tooltip";
import { CandlesIcon } from "@/icon/icons/candles";
import React, { useEffect, useState } from "react";
import { BarIcon } from "@/icon/icons/bar";
import { HollowCandlesIcon } from "@/icon/icons/hollowCandles";
import { LineIcon } from "@/icon/icons/line";
import { AreaIcon } from "@/icon/icons/Area";
import { BaseLineIcon } from "@/icon/icons/baseLine";
import { cn } from "@/utils/css";

const lineTypeList = [
  {
    icon: <BarIcon fill="currentColor" size={20} />,
    label: "Bars",
    value: "0",
  },
  {
    icon: <CandlesIcon fill="currentColor" size={20} />,
    label: "Candles",
    value: "1",
  },
  {
    icon: <HollowCandlesIcon fill="currentColor" size={20} />,
    label: "Hollow candles",
    value: "9",
  },
  {
    icon: <LineIcon fill="currentColor" size={20} />,
    label: "Line",
    value: "2",
  },
  {
    icon: <AreaIcon fill="currentColor" size={20} />,
    label: "Area",
    value: "3",
  },
  {
    icon: <BaseLineIcon fill="currentColor" size={20} />,
    label: "Baseline",
    value: "10",
  },
];

interface IProps {
  lineType: string;
  changeLineType: (type: string) => void;
}
export default function LineTypeSelect({ lineType, changeLineType }: IProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const [currentIcon, setCurrentIcon] = useState<any>(lineTypeList[1].icon);

  useEffect(() => {
    console.log("-- linetype", lineType);
    const line = lineTypeList.find((item) => item.value === lineType);
    if (line) {
      return setCurrentIcon(line.icon);
    }
  }, [lineType]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <div ref={triggerRef} className="orderly-h-[20px]">
          <Tooltip content="Line type" className="orderly-max-w-[200px]">
            <button className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast">
              {currentIcon}
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{ minWidth: "256px", padding: 0, margin: 0 }}
      >
        <div className="orderly-flex orderly-flex-col orderly-p-6 orderly-gap-6">
          {lineTypeList.map((item) => (
            <div
              key={item.value}
              onClick={() => changeLineType(item.value)}
              className={cn(
                "orderly-text-base-contrast-54 hover:orderly-text-base-contrast orderly-cursor-pointer orderly-text-xs orderly-flex orderly-justify-start orderly-items-center orderly-gap-3",
                lineType === item.value && "orderly-text-base-contrast"
              )}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
