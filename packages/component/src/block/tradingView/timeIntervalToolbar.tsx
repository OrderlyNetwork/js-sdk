import { FC } from "react";
import { TimeInterval } from "./types";

export interface TimeIntervalToolbarProps {
  intervals: TimeInterval[];
  onIntervalChange?: (interval: TimeInterval) => void;
}

export const TimeIntervalToolbar: FC<TimeIntervalToolbarProps> = (props) => {
  return (
    <div className="flex justify-around">
      {props.intervals.map((interval) => {
        return (
          <button
            className="p-3 flex-1"
            key={interval}
            onClick={() => {
              props.onIntervalChange?.(interval);
            }}
          >
            {interval}
          </button>
        );
      })}
    </div>
  );
};
