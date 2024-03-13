import React from "react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TimeIntervalToolbar,
  type TimeIntervalToolbarProps,
} from "./timeIntervalToolbar";
import { type TradingViewChartProps } from "./tradingViewChart";
import { TimeInterval } from "@/block/tradingView/types";
import { TradingView, ChartMode } from "@orderly.network/trading-view";

import { toast } from "@/toast";
import { Spinner } from "@/spinner";

export type TradingViewChartConfig = TradingViewChartProps &
  TimeIntervalToolbarProps & {
    scriptSRC?: string;
    library_path: string;
    overrides?: Record<string, string>;
    customCssUrl?: string;
    // apiBaseUrl: string;
  };

export const TradingViewChart: FC<TradingViewChartConfig> = (props) => {
  const { intervals } = props;
  const [timeInterval, setTimeInterval] = useState<TimeInterval>(() => {
    const tradingViewSDK_adapter = localStorage.getItem(
      "TradingViewSDK_adapter"
    );
    if (tradingViewSDK_adapter) {
      const data = JSON.parse(tradingViewSDK_adapter);
      const savedIntervals = data["chart.lastUsedTimeBasedResolution"];
      return savedIntervals || ("1" as TimeInterval);
    }

    return "1";
  });

  const onIntervalChange = useCallback((interval: TimeInterval) => {
    setTimeInterval(interval);
  }, []);

  if (!props.scriptSRC) {
    return null;
  }

  return (
    <div className="orderly-h-[240px]">
      <TimeIntervalToolbar
        intervals={intervals}
        timeInterval={timeInterval}
        onIntervalChange={(timeInterval) => {
          onIntervalChange(timeInterval);
        }}
      />
      <TradingView
        symbol={props.symbol}
        mode={ChartMode.MOBILE}
        interval={timeInterval}
        libraryPath={props.library_path}
        tradingViewScriptSrc={props?.scriptSRC}
        tradingViewCustomCssUrl={props?.customCssUrl}
        overrides={props.overrides}
        onToast={toast}
        loadingElement={<Spinner />}
      />
    </div>
  );
};
