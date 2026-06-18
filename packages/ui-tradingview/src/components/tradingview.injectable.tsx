import { injectable } from "@orderly.network/ui";
import type { IChartingLibraryWidget } from "../tradingviewAdapter/charting_library";
import type { TradingviewUIPropsInterface } from "../type";
import { TradingviewChart } from "./tradingview.chart";

export const InjectableTradingviewDesktop =
  injectable<TradingviewUIPropsInterface>(
    TradingviewChart,
    "TradingView.Desktop",
  );

/** Props for the chart-overlay interceptor target; rendered once the chart widget is ready. */
export type ChartOverlayProps = {
  widget: IChartingLibraryWidget;
  symbol: string;
};

/** Default renders nothing; a plugin intercepts `Trading.Chart.Overlay` to draw on the chart. */
export const InjectableChartOverlay = injectable<ChartOverlayProps>(
  () => null,
  "Trading.Chart.Overlay",
);
