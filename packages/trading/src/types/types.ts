import type { TradingPageState as SharedTradingPageState } from "@orderly.network/trading-shared";
import type { PredictionIntegrationState } from "./predictionIntegration";

export {
  type layoutInfo,
  type PosterLayoutConfig,
  type ShareOptions,
  TradingFeatures,
  type BasicSymbolInfo,
  type TradingViewConfigInterface,
  type ColorConfigInterface,
  type ReferralProps,
  type TradingRewardsProps,
  type TradingPageProps,
} from "@orderly.network/trading-shared";

export type TradingPageState = SharedTradingPageState &
  PredictionIntegrationState;
