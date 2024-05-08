import { API } from "@orderly.network/types";
import { TradingFeatures } from "./features";
import { ReactNode } from "react";

export interface TradingPageProps {
  symbol: string;
  tradingViewConfig: TradingViewConfigInterface;
  onSymbolChange?: (symbol: API.Symbol) => void;
  // enableFeatures?: TradingFeatures[];
  disableFeatures?: TradingFeatures[];
  overrideFeatures?: Record<TradingFeatures, ReactNode>;
}

interface TradingViewConfigInterface {
  scriptSRC?: string;
  library_path: string;
  overrides?: Record<string, string>;
  studiesOverrides?: Record<string, string>;
  customCssUrl?: string;
  colorConfig?: ColorConfigInterface;
}

export interface ColorConfigInterface {
  chartBG?: string;
  upColor?: string;
  downColor?: string;
  pnlUpColor?: string;
  pnlDownColor?: string;
  pnlZoreColor?: string;
  textColor?: string;
  qtyTextColor?: string;
  font?: string;
  closeIcon?: string;
}
