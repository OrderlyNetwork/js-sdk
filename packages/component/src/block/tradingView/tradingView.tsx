import { FC, useCallback, useMemo, useState } from "react";
import {
  type TimeIntervalItem,
  TimeIntervalToolbar,
  type TimeIntervalToolbarProps,
} from "./timeIntervalToolbar";
import {
  TradingViewChart,
  type TradingViewChartProps,
} from "./tradingViewChart";
import { TimeInterval } from "@/block/tradingView/types";

export const TradingView: FC<
  TradingViewChartProps & TimeIntervalToolbarProps
> = (props) => {
  const { intervals, ...chartProps } = props;

  const size = useMemo<{ width: string; height: string }>(() => {
    if (chartProps.autosize) {
      return { width: "100%", height: "100%" };
    }

    return {
      width: `${chartProps.width}px`,
      height: `${chartProps.height}px`,
    };
  }, [chartProps.width, chartProps.height]);

  const onIntervalChange = useCallback((interval: TimeInterval) => {}, []);

  return (
    <div>
      <TimeIntervalToolbar
        intervals={intervals}
        // timeInterval={timeInterval}
        onIntervalChange={(timeInterval) => {
          // setTimeInterval(timeInterval);
          onIntervalChange(timeInterval);
        }}
      />
      <TradingViewChart {...chartProps} {...size} />
    </div>
  );
};
