import { TradingViewChartConfig } from "@/block/tradingView";
import { API } from "@orderly.network/types";
import { TradingFeatures } from "./features";
import { ReactNode } from "react";

export interface TradingPageProps {
  symbol: string;
  tradingViewConfig: TradingViewChartConfig;
  onSymbolChange?: (symbol: API.Symbol) => void;
  // enableFeatures?: TradingFeatures[];
  disableFeatures?: TradingFeatures[];
  overrideFeatures?: Record<TradingFeatures, ReactNode>;
}
