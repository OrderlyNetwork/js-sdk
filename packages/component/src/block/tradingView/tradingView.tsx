import React from "react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TimeIntervalToolbar,
  type TimeIntervalToolbarProps,
} from "./timeIntervalToolbar";
import { type TradingViewChartProps } from "./tradingViewChart";
import { TimeInterval } from "@/block/tradingView/types";
import {
  IChartingLibraryWidget,
  ResolutionString,
  widget,
} from "@/@types/charting_library";
import DataFeed from "./dataFeed";
import { useWS } from "@orderly.network/hooks";
import { ORDERLY_TRADING_VIEW_INTERVAL } from "./constants";

declare const TradingView: any;

export type TradingViewChartConfig = TradingViewChartProps &
  TimeIntervalToolbarProps & {
    scriptSRC?: string;
    library_path: string;
    customCssUrl?: string;
    apiBaseUrl: string;
  };

export const TradingViewChart: FC<TradingViewChartConfig> = (props) => {
  const {
    intervals,
    disabled_features = [
      "header_widget",
      "control_bar",
      "left_toolbar",
      // "header_widget_dom_node",
      "timeframes_toolbar",
      "go_to_date",
      "timezone_menu",
      // "symbol_info",
      "create_volume_indicator_by_default",
    ],

    scriptSRC = "/tradingview/charting_library/charting_library.js",
    library_path = "/tradingview/charting_library/",
    customCssUrl,
    ...chartProps
  } = props;

  const [timeInterval, setTimeInterval] = useState<TimeInterval>(() => {
    const saved_intervals = localStorage.getItem(
      ORDERLY_TRADING_VIEW_INTERVAL
    ) as TimeInterval;

    console.log("saved_intervals", saved_intervals);
    return saved_intervals || ((intervals?.[0].value ?? "1") as TimeInterval);
  });

  const ws = useWS();

  const containerRef = useRef<HTMLDivElement>(null);

  const size = useMemo<{ width: string; height: string }>(() => {
    return {
      // width: `${chartProps.width}px`,
      width: "100%",
      height: `${chartProps.height}px`,
    };
  }, [chartProps.width, chartProps.height]);

  const wigetRef = useRef<IChartingLibraryWidget | null>(null);

  const onIntervalChange = useCallback((interval: TimeInterval) => {
    setTimeInterval(interval);
    wigetRef.current?.activeChart().setResolution(interval as ResolutionString);
    localStorage.setItem(ORDERLY_TRADING_VIEW_INTERVAL, interval);
  }, []);

  useEffect(() => {
    if (props.symbol) {
      // console.log("wigetRef.current", wigetRef.current?.activeChart());
      wigetRef.current?.activeChart().setSymbol(props.symbol);
    }
  }, [props.symbol]);

  useEffect(() => {
    let refValue: any;

    if (containerRef.current) {
      const script = document.createElement("script");
      script.setAttribute("data-nscript", "afterInteractive");
      script.src = scriptSRC;
      script.async = true;
      script.type = "text/javascript";

      script.onload = () => {
        if (typeof TradingView !== undefined) {
          console.log("TradingView????", chartProps);

          wigetRef.current = new TradingView.widget({
            symbol: props.symbol,
            container: containerRef.current,
            interval: timeInterval,
            // theme: "Dark",
            overrides: {
              // "paneProperties.background": "#ffffff",
              // "mainSeriesProperties.style": 1,
              "paneProperties.backgroundType": "solid",
              "paneProperties.background": "#151822",

              "mainSeriesProperties.candleStyle.upColor": "#439687",
              "mainSeriesProperties.candleStyle.downColor": "#DE5E57",
              "mainSeriesProperties.candleStyle.borderColor": "#378658",
              "mainSeriesProperties.candleStyle.borderUpColor": "#439687",
              "mainSeriesProperties.candleStyle.borderDownColor": "#DE5E57",
              "mainSeriesProperties.candleStyle.wickUpColor": "#439687",
              "mainSeriesProperties.candleStyle.wickDownColor": "#DE5E57",
            },
            preset: "mobile",
            // loading_screen: { backgroundColor: "#439687" },
            datafeed: new DataFeed(
              {
                apiBaseUrl: props.apiBaseUrl,
              },
              ws
            ),
            library_path,
            disabled_features,
            width: "100%",
            // customCssUrl,
            ...chartProps,
          });
        }
      };

      containerRef.current.appendChild(script);
      refValue = containerRef.current;
    }
    return () => {
      if (refValue) {
        while (refValue.firstChild) {
          refValue.removeChild(refValue.firstChild);
        }
      }
    };
  }, []);

  return (
    <>
      <TimeIntervalToolbar
        intervals={intervals}
        timeInterval={timeInterval}
        onIntervalChange={(timeInterval) => {
          onIntervalChange(timeInterval);
        }}
      />
      {/* <TradingViewChart {...chartProps} {...size} /> */}
      <div className="w-full h-full" ref={containerRef}></div>
    </>
  );
};
