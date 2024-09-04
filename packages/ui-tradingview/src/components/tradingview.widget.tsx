import { TradingviewUi } from "./tradingview.ui";
import { TradingviewWidgetPropsInterface } from "../type";
import { useTradingviewScript } from "./tradingview.script";

export function TradingviewWidget(widgetProps: TradingviewWidgetPropsInterface) {
  const state = useTradingviewScript(widgetProps);
  return (
    <TradingviewUi  {...state}/>
  );
}