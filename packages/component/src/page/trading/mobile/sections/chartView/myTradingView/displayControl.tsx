import { KChartIcon } from "@/icon/icons/kchart";
import React, { useEffect, useState } from "react";
import { cn } from "@/utils/css";
import { ChevronDown } from "lucide-react";
import { Switch } from "@/switch";
import { DisplayControlSettingInterface } from "@orderly.network/trading-view";
import { ArrowIcon } from "@/icon";
import { CheckSmallIcon } from "@/icon/icons/checkSmall";
import { ExpandIcon } from "@/icon/icons/expland";

const DisplayControlMap: {
  label: string;
  id: keyof DisplayControlSettingInterface;
}[][] = [
  [
    {
      label: "Position",
      id: "position",
    },
    {
      label: "Buy/Sell",
      id: "buySell",
    },
  ],
  [
    {
      label: "Limit Orders",
      id: "limitOrders",
    },
    {
      label: "Stop orders",
      id: "stopOrders",
    },
  ],
  [
    {
      label: "TP/SL",
      id: "tpsl",
    },
    {
      label: "Position TP/SL",
      id: "positionTpsl",
    },
  ],
];

interface IProps {
  displayControlState: DisplayControlSettingInterface;
  changeDisplayControlState: (state: DisplayControlSettingInterface) => void;
}
export default function DisplayControl({
  displayControlState,
  changeDisplayControlState,
}: IProps) {
  const [open, setOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (
        containerRef.current === event.target ||
        containerRef.current?.contains(event.target as Element)
      ) {
        return;
      }
      setOpen(false);
      //   document.removeEventListener("click", onClick);
    };

    const onClick = (event: MouseEvent) => {
      if (
        containerRef.current === event.target ||
        containerRef.current?.contains(event.target as Element)
      ) {
        return;
      }
      //   event.stopPropagation();
      setOpen(false);
    };

    if (open) {
      //   const onTouchMove = () => {};
      setTimeout(() => {
        document.addEventListener("touchstart", onTouchStart, {
          capture: true,
          once: true,
        });

        document.addEventListener("click", onClick, {
          capture: true,
          once: true,
        });
      }, 100);

      return () => {
        //
        document.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("click", onClick);
      };
    } else {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("click", onClick);
    }
  }, [open]);

  return (
    <div ref={containerRef}>
      <div
        className={cn(
          "orderly-flex orderly-items-center orderly-justify-center orderly-w-[44px] orderly-h-[36px] orderly-rounded orderly-text-base-contrast-54",
          open && "orderly-text-base-contrast"
        )}
      >
        <button
          className="orderly-flex orderly-items-center "
          onClick={() => setOpen((open) => !open)}
        >
          <KChartIcon size={20} fill="currentColor" />

          <ExpandIcon
            size={16}
            className={cn(
              "orderly-transition-transform",
              open && "orderly-rotate-180"
            )}
          />
        </button>
      </div>

      {open && (
        <div
          data-state={open ? "open" : "closed"}
          className={cn(
            "orderly-z-50 orderly-min-w-[8rem] orderly-overflow-hidden orderly-rounded orderly-bg-base-800 orderly-px-4 orderly-py-3 orderly-text-popover-foreground orderly-shadow-md orderly-absolute orderly-left-0 orderly-top-full orderly-w-full orderly-space-y-1",
            "data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0 data-[state=closed]:orderly-zoom-out-95 data-[state=open]:orderly-zoom-in-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2"
          )}
        >
          <div className="orderly-text-base-contrast-54 orderly-text-3xs orderly-pb-3">
            Display settings
          </div>
          <div className="orderly-flex orderly-flex-col orderly-gap-3">
            {DisplayControlMap.map((row) => (
              <div className="orderly-flex orderly-flex-row orderly-gap-3">
                {row.map((item) => (
                  <div
                    className={cn(
                      "orderly-text-3xs orderly-relative orderly-flex orderly-items-center orderly-justify-center orderly-w-[50%] orderly-bg-base-600 orderly-h-8 orderly-text-base-contrast-36 orderly-rounded-md",
                      displayControlState[item.id] &&
                        "orderly-text-base-contrast orderly-border orderly-border-base-contrast"
                    )}
                    id={item.id}
                    onClick={() => {
                      changeDisplayControlState({
                        ...displayControlState,
                        [item.id]: !displayControlState[item.id],
                      });
                    }}
                  >
                    {displayControlState[item.id] && (
                      <div className="orderly-absolute -orderly-top-[1px] -orderly-right-[1px]">
                        <CheckSmallIcon size={12} />
                      </div>
                    )}
                    <div>{item.label}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
