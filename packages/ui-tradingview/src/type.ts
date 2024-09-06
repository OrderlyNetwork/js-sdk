import { ChartMode, ColorConfigInterface } from "./tradingviewAdapter/type";

export interface TradingviewWidgetPropsInterface{
  symbol?: string;
  mode?: ChartMode;
  libraryPath?: string;
  tradingViewScriptSrc?: string;
  tradingViewCustomCssUrl?: string;
  overrides?: any;
  studiesOverrides?: any;
  fullscreen?: boolean;
  theme?: string;
  colorConfig?: ColorConfigInterface,
}

export interface TradingviewUIPropsInterface {
  tradingViewScriptSrc?: string;
  chartRef: React.Ref<HTMLDivElement>;
  interval?: string;
  changeDisplaySetting: (setting: DisplayControlSettingInterface) => void;
  displayControlState: DisplayControlSettingInterface;
  changeInterval: (newInterval: string) => void;
  lineType: string;
  changeLineType: (newLineType: string) => void;
  openChartSetting: () => void;
  openChartIndicators: () => void;
}

export interface DisplayControlSettingInterface {
  position: boolean;
  buySell: boolean;
  limitOrders: boolean;
  stopOrders: boolean;
  tpsl: boolean;
  positionTpsl: boolean;
}

