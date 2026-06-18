/**
 * Module augmentation: maps TradingView interceptor target paths to props types.
 * Import from @orderly.network/ui-tradingview to enable typed props in
 * createInterceptor("TradingView.DisplayControl.DesktopMenuList", ...).
 */
/// <reference types="@orderly.network/plugin-core" />
import type { DesktopDisplayControlMenuListProps } from "./components/displayControl/common";
import type { ChartOverlayProps } from "./components/tradingview.injectable";

declare module "@orderly.network/plugin-core" {
  interface InterceptorTargetPropsMap {
    "TradingView.DisplayControl.DesktopMenuList": DesktopDisplayControlMenuListProps;
    "Trading.Chart.Overlay": ChartOverlayProps;
  }
}
