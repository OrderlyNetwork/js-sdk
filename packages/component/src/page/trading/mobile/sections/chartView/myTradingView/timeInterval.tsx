import React, { useEffect, useMemo, useState } from "react";
import { cn } from "@/utils/css";
import { ExpandIcon } from "@/icon/icons/expland";

const timeIntervalMap = [
  [
    {
      value: "3",
      label: "3m",
    },
    {
      value: "5",
      label: "5m",
    },

    {
      value: "30",
      label: "30m",
    },

    {
      value: "120",
      label: "2h",
    },
  ],
  [
    {
      value: "360",
      label: "6h",
    },
    {
      value: "720",
      label: "12h",
    },
    {
      value: "3d",
      label: "3D",
    },
    {
      value: "1M",
      label: "1M",
    },
  ],
];

interface IProps {
  timeInterval: string;
  changeTimeInterval: (interval: string) => void;
}
export default function TimeInterval({
  changeTimeInterval,
  timeInterval,
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
        });

        document.addEventListener("click", onClick, {
          capture: true,
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

  const currentIntervalIsInExpand = useMemo(() => {
    for (const row of timeIntervalMap) {
      for (const item of row) {
        if (item.value === timeInterval) {
          return item.label;
        }
      }
    }
    return null;
  }, [timeInterval]);
  useEffect(() => {}, [timeInterval]);

  return (
    <div ref={containerRef}>
      <button
        className={cn(
          "orderly-flex orderly-items-center ",
          (open || currentIntervalIsInExpand) && "orderly-text-base-contrast"
        )}
        onClick={() => setOpen((open) => !open)}
      >
        <div>{currentIntervalIsInExpand ?? "More"}</div>

        <ExpandIcon
          size={16}
          className={cn(
            "orderly-transition-transform",
            open && "orderly-rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          data-state={open ? "open" : "closed"}
          className={cn(
            "orderly-z-50 orderly-min-w-[8rem] orderly-overflow-hidden orderly-rounded orderly-bg-base-800 orderly-px-4 orderly-py-3 orderly-text-popover-foreground orderly-shadow-md orderly-absolute orderly-left-0 orderly-top-full orderly-w-full orderly-space-y-1",
            "data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0 data-[state=closed]:orderly-zoom-out-95 data-[state=open]:orderly-zoom-in-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2"
          )}
        >
          <div className="orderly-flex orderly-flex-col orderly-gap-3">
            {timeIntervalMap.map((row, id) => (
              <div
                className="orderly-flex orderly-flex-row orderly-gap-3"
                key={id}
              >
                {row.map((item) => (
                  <div
                    className={cn(
                      "orderly-text-3xs orderly-relative orderly-flex orderly-items-center orderly-justify-center orderly-w-[50%] orderly-bg-base-600 orderly-h-8 orderly-text-base-contrast-36 orderly-rounded-md",
                      item.value === timeInterval &&
                        "orderly-text-base-contrast orderly-border orderly-border-base-contrast"
                    )}
                    key={item.value}
                    onClick={() => {
                      changeTimeInterval(item.value);
                    }}
                  >
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
