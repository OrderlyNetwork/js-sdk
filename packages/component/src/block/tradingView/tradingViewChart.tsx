import React, { useId } from "react";

import { Widget } from "./widget";
import type {
  ColorTheme,
  Locales,
  TimeInterval,
  Timezone,
  WidgetFeatures,
} from "./types";
import DataFeed from "./dataFeed";

export type TradingViewChartProps = {
  width?: number | string;
  height?: number | string;
  autosize?: boolean;
  symbol?: string;
  interval?: TimeInterval;
  range?: "1D" | "5D" | "1M" | "3M" | "6M" | "YTD" | "12M" | "60M" | "ALL";
  timezone?: Timezone;
  theme?: ColorTheme;
  style?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  locale?: Locales | "hu_HU" | "fa_IR";
  toolbar_bg?: string;
  enable_publishing?: boolean;
  withdateranges?: boolean;
  hide_top_toolbar?: boolean;
  hide_legend?: boolean;
  hide_side_toolbar?: boolean;
  allow_symbol_change?: boolean;
  save_image?: boolean;
  details?: boolean;
  hotlist?: boolean;
  calendar?: boolean;
  show_popup_button?: boolean;
  popup_width?: string;
  popup_height?: string;
  watchlist?: string[];
  //   studies?: Studies[];
  disabled_features?: WidgetFeatures[];
  enabled_features?: WidgetFeatures[];

  container_id?: string;
  children?: never;
  // =========== special props ===========
  apiBaseUrl: string;
};

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  width = 980,
  height = 610,
  autosize = false,
  symbol,
  interval = "1",
  range = undefined,
  timezone = "UTC",
  theme = "dark",
  style = "1",
  locale = "en",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  hide_top_toolbar = true,
  hide_legend = false,
  withdateranges = true,
  hide_side_toolbar = true,
  allow_symbol_change = true,
  save_image = true,
  details = false,
  hotlist = false,
  calendar = false,
  show_popup_button = false,
  popup_width = "600",
  popup_height = "400",
  watchlist = undefined,
  //   studies = undefined,
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
  enabled_features = undefined,
  container_id,

  //   copyrightStyles,

  ...props
}) => {
  const uid = useId();
  container_id = container_id || `tradingview_${uid}`;
  return (
    <div
      id="tradingview_widget_wrapper"
      className="w-full h-full"
      style={{ height }}
    >
      <Widget
        scriptHTML={{
          ...(!autosize ? { width } : { width: "100%" }),
          ...(!autosize ? { height } : { height: "100%" }),
          autosize,
          fullscreen: false,
          symbol,
          ...(!range ? { interval } : { range }),
          timezone,
          theme,
          style,
          locale,
          toolbar_bg,
          enable_publishing,
          hide_top_toolbar,
          hide_legend,
          withdateranges,
          hide_side_toolbar,
          allow_symbol_change,
          save_image,
          details,
          hotlist,
          calendar,
          ...(show_popup_button && {
            show_popup_button,
            popup_width,
            popup_height,
          }),
          watchlist,
          //   studies,
          disabled_features,
          enabled_features,
          container_id,
          overrides: {
            // borderColor: "red",
            "mainSeriesProperties.candleStyle.upColor": "#439687",
            "mainSeriesProperties.candleStyle.downColor": "#DE5E57",
            "mainSeriesProperties.candleStyle.borderColor": "#378658",
            "mainSeriesProperties.candleStyle.borderUpColor": "#439687",
            "mainSeriesProperties.candleStyle.borderDownColor": "#DE5E57",
            "mainSeriesProperties.candleStyle.wickUpColor": "#439687",
            "mainSeriesProperties.candleStyle.wickDownColor": "#DE5E57",
            // volumePaneSize: "small",
          },
          // loading_screen: {
          //   backgroundColor: "#000000",
          //   foregroundColor: "#000000",
          // },
          datafeed: new DataFeed({
            apiBaseUrl: props.apiBaseUrl,
          }),
          library_path: "/tradingview/charting_library/",
          ...props,
        }}
        // scriptSRC="https://s3.tradingview.com/tv.js"
        scriptSRC="/tradingview/charting_library/charting_library.js"
        // scriptSRC="https://futures-dex-iap.woo.org/assets/woo-chart/charting_library/charting_library.js"
        containerId={container_id}
        type="Widget"
      />
    </div>
  );
};
