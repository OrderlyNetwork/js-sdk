import React from "react";
import { cn } from "@/utils/css";

const timeIntervalMap = [
  {
    value: "1",
    label: "1m",
  },
  {
    value: "3",
    label: "3m",
  },
  {
    value: "5",
    label: "5m",
  },
  {
    value: "15",
    label: "15m",
  },
  {
    value: "30",
    label: "30m",
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
    value: "720",
    label: "12h",
  },
  {
    value: "1D",
    label: "1D",
  },

  {
    value: "1W",
    label: "1W",
  },
  {
    value: "1M",
    label: "1M",
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
    <div className="orderly-text-3xs orderly-text-base-contrast-54 orderly-flex orderly-gap-4 orderly-items-center">
      {timeIntervalMap.map((item) => (
        <div
          className={cn(
            "orderly-text-3xs orderly-cursor-pointer",
            timeInterval === item.value && "orderly-text-base-contrast"
          )}
          id={item.value}
          onClick={() => changeTimeInterval(item.value)}
        >
          {item.label}
        </div>
      ))}
    </div>
  );
}
