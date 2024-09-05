import { ChartMode, ColorConfigInterface } from "./tradingviewAdapter/type";

export interface TradingviewWidgetPropsInterface{
  symbol?: string;
  mode?: ChartMode;
  libraryPath?: string;
  tradingViewScriptSrc?: string;
  tradingViewCustomCssUrl?: string;
  interval?: string;
  // customer overrides tradingview
  overrides?: any;
  studiesOverrides?: any;
  fullscreen?: boolean;
  theme?: string;
  colorConfig: ColorConfigInterface,
}

export interface TradingviewUIPropsInterface {
  tradingViewScriptSrc?: string;
  chartRef: React.Ref<HTMLDivElement>;
}

export interface DisplayControlSettingInterface {
  position: boolean;
  buySell: boolean;
  limitOrders: boolean;
  stopOrders: boolean;
  tpsl: boolean;
  positionTpsl: boolean;
}

