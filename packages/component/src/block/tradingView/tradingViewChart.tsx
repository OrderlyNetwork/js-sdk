import type {
  ColorTheme,
  Locales,
  TimeInterval,
  Timezone,
  WidgetFeatures,
} from "./types";
// import DataFeed from "./dataFeed";
// import { IChartingLibraryWidget } from "@/@types/charting_library";

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
  // apiBaseUrl: string;
};
