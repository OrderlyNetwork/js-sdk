import { i18n } from "@orderly.network/i18n";
import type { RoundStatus } from "./binary/binaryRoundView";
import type {
  OneTapBlockReason,
  PredictionDataTab,
  PredictionOrderSide,
  PredictionOrderType,
  PredictionOutcome,
  PredictionResult,
  PredictionRoundPhase,
} from "./prediction.types";

/**
 * Label maps for domain-union keys. Every value is a literal `i18n.t("key")`
 * call so static key extraction sees the full key, and the `Record<union,
 * string>` return type turns a missing entry into a compile error. The maps
 * are rebuilt on each render call, so `i18n.t` always reads the current
 * language (consumer components subscribe via `useTranslation`).
 */
export const outcomeLabels = (): Record<PredictionOutcome, string> => ({
  up: i18n.t("prediction.up"),
  down: i18n.t("prediction.down"),
});

export const resultLabels = (): Record<PredictionResult, string> => ({
  ...outcomeLabels(),
  tie: i18n.t("prediction.tie"),
});

export const sideLabels = (): Record<PredictionOrderSide, string> => ({
  buy: i18n.t("common.buy"),
  sell: i18n.t("common.sell"),
});

export const orderTypeLabels = (): Record<PredictionOrderType, string> => ({
  market: i18n.t("common.market"),
  limit: i18n.t("common.limit"),
});

export const phaseLabels = (): Record<PredictionRoundPhase, string> => ({
  trading: i18n.t("prediction.phase.trading"),
  closingSoon: i18n.t("prediction.phase.closingSoon"),
  closed: i18n.t("prediction.phase.closed"),
  resolvedUp: i18n.t("prediction.phase.resolvedUp"),
  resolvedDown: i18n.t("prediction.phase.resolvedDown"),
  resolvedTie: i18n.t("prediction.phase.resolvedTie"),
});

export const roundStatusLabels = (): Record<RoundStatus, string> => ({
  ended: i18n.t("prediction.rounds.ended"),
  live: i18n.t("prediction.rounds.live"),
  upcoming: i18n.t("prediction.rounds.upcoming"),
});

export const blockReasonLabels = (): Record<OneTapBlockReason, string> => ({
  "prediction.invalidOrder": i18n.t("prediction.invalidOrder"),
  "prediction.message.noExecutableQuotes": i18n.t(
    "prediction.message.noExecutableQuotes",
  ),
  "prediction.message.roundNotTradable": i18n.t(
    "prediction.message.roundNotTradable",
  ),
  "prediction.message.regionRestricted": i18n.t(
    "prediction.message.regionRestricted",
  ),
  "prediction.message.orderFailed": i18n.t("prediction.message.orderFailed"),
  "prediction.message.insufficientBalance": i18n.t(
    "prediction.message.insufficientBalance",
  ),
  "prediction.message.slippageExceeded": i18n.t(
    "prediction.message.slippageExceeded",
  ),
});

export const dataTabTitles = (): Record<PredictionDataTab, string> => ({
  predictions: i18n.t("prediction.tab.positions"),
  openOrders: i18n.t("prediction.tab.openOrders"),
  filled: i18n.t("prediction.tab.filled"),
  predictionHistory: i18n.t("prediction.tab.predictionHistory"),
  orderHistory: i18n.t("prediction.tab.orderHistory"),
  assets: i18n.t("prediction.tab.assets"),
  history: i18n.t("trading.history"),
});
