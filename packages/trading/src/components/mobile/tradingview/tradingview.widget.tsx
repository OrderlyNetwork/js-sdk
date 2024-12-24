import { TradingviewUi } from "./tradingview.ui";
import { useTradingviewScript } from "./tradingview.script";
import { TradingViewConfigInterface } from "../../../types/types";

export interface TradingviewWidgetProps {
  symbol: string;
  tradingViewConfig:TradingViewConfigInterface;
}

export function TradingviewWidget(props: TradingviewWidgetProps) {
  const state = useTradingviewScript(props);
  return (
    <TradingviewUi {...state}/>
  )
}