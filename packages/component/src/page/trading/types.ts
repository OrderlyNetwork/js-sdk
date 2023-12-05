import { TradingViewChartConfig } from "@/block/tradingView";
import { API } from "@orderly.network/types";

export interface TradingPageProps {
  symbol: string;
  tradingViewConfig: TradingViewChartConfig;
  onSymbolChange?: (symbol: API.Symbol) => void;
}
