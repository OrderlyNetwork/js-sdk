import { FC, useMemo } from "react";
import {
  TimeIntervalToolbar,
  type TimeIntervalToolbarProps,
} from "./timeIntervalToolbar";
import {
  TradingViewChart,
  type TradingViewChartProps,
} from "./tradingViewChart";

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

  return (
    <div style={{ ...size }}>
      <TimeIntervalToolbar intervals={intervals} />
      <TradingViewChart {...chartProps} {...size} />
    </div>
  );
};
