import { FC, useState } from "react";
import { TimeInterval } from "./types";
import { cn } from "@/utils/css";

export type TimeIntervalItem = {
  value: string;
  label: string;
};

export const defaultTimeInterval = [
  { value: "1", label: "1m" },
  // {
  //   value: "3",
  //   label: "3m",
  // },
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
    value: "4h",
    label: "4h",
  },
  {
    value: "12h",
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
];

export interface TimeIntervalToolbarProps {
  intervals?: TimeIntervalItem[];
  timeInterval?: TimeInterval;
  onIntervalChange?: (interval: TimeInterval) => void;
}

export const TimeIntervalToolbar: FC<TimeIntervalToolbarProps> = ({
  intervals = defaultTimeInterval,
  onIntervalChange,
}) => {
  const [timeInterval, setTimeInterval] = useState<TimeInterval>(
    () => intervals[0].value as TimeInterval
  );

  return (
    <div className="flex justify-around h-[40px]">
      {intervals.map((interval) => {
        return (
          <button
            className={cn(
              "py-3 px-1 flex-1 text-base-contrast/20",
              timeInterval === interval.value && "text-base-contrast"
            )}
            key={interval.value}
            onClick={() => {
              setTimeInterval(interval.value as TimeInterval);
              onIntervalChange?.(interval.value as TimeInterval);
            }}
          >
            {interval.label}
          </button>
        );
      })}
    </div>
  );
};
