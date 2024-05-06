import { Tooltip } from "@/tooltip";
import { KChartIcon } from "@/icon/icons/kchart";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import { cn } from "@/utils/css";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/switch";
import { DisplayControlStateInterface } from "@/page/trading/desktop/myTradingview/index";

const DisplayControlMap: {
  label: string;
  id: keyof DisplayControlStateInterface;
}[] = [
  {
    label: "Position",
    id: "position",
  },
  {
    label: "Buy/Sell",
    id: "buySell",
  },
  {
    label: "Limit Orders",
    id: "limitOrders",
  },
  {
    label: "Stop orders",
    id: "stopOrders",
  },
  {
    label: "TP/SL",
    id: "tpsl",
  },
  {
    label: "Position TP/SL",
    id: "positionTpsl",
  },
];

interface IProps {
  displayControlState: DisplayControlStateInterface;
  changeDisplayControlState: (state: DisplayControlStateInterface) => void;
}
export default function DisplayControl({
  displayControlState,
  changeDisplayControlState,
}: IProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <div
          ref={triggerRef}
          className={cn(
            "orderly-flex orderly-items-center orderly-justify-center orderly-w-[44px] orderly-h-[36px] orderly-rounded",

            open && "orderly-bg-base-500"
          )}
        >
          <Tooltip content="Display settings" className="orderly-max-w-[200px]">
            <button className="orderly-flex orderly-items-center orderly-text-base-contrast-54 hover:orderly-text-base-contrast">
              <KChartIcon size={20} fill="currentColor" />
              {/* @ts-ignore */}

              <ChevronDown
                size={16}
                className={cn(
                  "orderly-transition-transform orderly-text-base-contrast-45 hover:orderly-text-base-contrast",
                  open && "orderly-rotate-180"
                )}
              />
            </button>
          </Tooltip>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        style={{ minWidth: "240px", padding: 0, margin: 0 }}
      >
        <div className="orderly-flex orderly-flex-col orderly-p-6 orderly-gap-6">
          {DisplayControlMap.map((item) => (
            <div
              className="orderly-text-xs orderly-flex orderly-items-center orderly-justify-between orderly-text-base-contrast-54"
              id={item.id}
            >
              <div>{item.label}</div>
              <Switch
                id={`orderly-display-control-${item.id}`}
                color={"primary"}
                checked={displayControlState[item.id]}
                onCheckedChange={(checked) => {
                  changeDisplayControlState({
                    ...displayControlState,
                    [item.id]: checked,
                  });
                }}
              />
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
