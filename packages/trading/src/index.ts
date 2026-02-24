/**
 * Side-effect: augment InterceptorTargetPropsMap for typed interceptor props.
 */
import "./types/interceptorTargets";

export type {
  ShareOptions,
  TradingPageProps,
  ReferralProps,
  TradingRewardsProps,
} from "./types/types";
export type { AccountState } from "./components/mobile/bottomNavBar/account/account.script";
export type { Props as OrderBookDesktopAsksProps } from "./components/desktop/orderBook/asks.desktop";

export * from "./components/desktop/dataList";
export * from "./components/base/lastTrades";
export * from "./components/desktop/assetView";
export * from "./components/base/orderBook";
export * from "./components/desktop/riskRate";
export * from "./components/desktop/orderBookAndTrades";
export * from "./components/desktop/layout/splitLayout/splitLayout";
export * from "./components/mobile/bottomNavBar";
export * from "./components/mobile/portfolioSheet";
export * from "./components/mobile/fundingRate";
export * from "./components/mobile/fundingRateModal";
export * from "./pages/trading";
export * from "./provider/tradingPageContext";
export * from "./provider/tradingPageProvider";
export * from "./hooks";
