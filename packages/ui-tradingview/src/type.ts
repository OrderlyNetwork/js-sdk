import { ChartMode } from "./utils/type";

export interface TradingviewWidgetPropsInterface{
  mode?: ChartMode;
  libraryPath?: string;
  tradingViewScriptSrc?: string;
  tradingViewCustomCssUrl?: string;
  interval?: string;
}

export interface TradingviewUIPropsInterface {
  tradingViewScriptSrc?: string;
}