import React from "react";
import { cn } from "@/utils/css";

const timeIntervalMap = [
  {
    value: "5",
    label: "5m",
  },

  {
    value: "30",
    label: "30m",
  },
  {
    value: "1M",
    label: "M",
  },
];

const defaultIntervalMap = [
  {
    value: "1",
    label: "1m",
  },
  {
    value: "15",
    label: "15m",
  },
  {
    value: "60",
    label: "1h",
  },
  {
    value: "240",
    label: "4h",
  },
  {
    value: "1D",
    label: "D",
  },

  {
    value: "1W",
    label: "W",
  },
];

interface IProps {
  timeInterval: string;
  changeTimeInterval: (interval: string) => void;
}
export default function TimeInterval({
  changeTimeInterval,
  timeInterval,
}: IProps) {
  return (
    <div className="orderly-text-2xs orderly-text-base-contrast-54 orderly-flex orderly-gap-[22px] orderly-items-center">
      {defaultIntervalMap.map((item) => (
        <div
          className={cn(
            "orderly-text-2xs orderly-cursor-pointer",
            timeInterval === item.value && "orderly-text-base-contrast"
          )}
          id={item.value}
          onClick={() => changeTimeInterval(item.value)}
        >
          {item.label}
        </div>
      ))}
      <div>More</div>
    </div>
  );
}
