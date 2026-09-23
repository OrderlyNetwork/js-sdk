import type { PredictionOrderPolicy } from "./predictionExecution";

export type PredictionOutcome = "up" | "down";
export type PredictionOrderSide = "buy" | "sell";
export type PredictionOrderType = "market" | "limit";
export type PredictionAmountUnit = "quote" | "outcome";
export type PredictionRoundPhase =
  | "trading"
  | "closingSoon"
  | "closed"
  | "resolving"
  | "resolvedUp"
  | "resolvedDown"
  | "void";
export type PredictionDataTab =
  | "openOrders"
  | "predictions"
  | "assets"
  | "orderHistory"
  | "filled"
  | "predictionHistory";

export type PredictionNotification = {
  id: number;
  message: string;
  tone: "success" | "danger";
};

export type PredictionPosition = {
  outcome: PredictionOutcome;
  quantity: number;
  averagePrice: number;
};

export type PredictionOpenOrder = {
  policy?: PredictionOrderPolicy;
  id: number;
  outcome: PredictionOutcome;
  side: PredictionOrderSide;
  type: PredictionOrderType;
  price: number;
  quantity: number;
  round: number;
  timestamp: number;
};

export type PredictionTrade = PredictionOpenOrder & {
  status: "filled" | "cancelled";
};

export type PredictionSettlement = {
  id: number;
  round: number;
  outcome: PredictionOutcome;
  quantity: number;
  averagePrice: number;
  settlementPrice: number;
  result?: PredictionOutcome | "closed";
  payout: number;
  pnl: number;
  settledAt: number;
};

export type PredictionMockPerpPosition = {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  averagePrice: number;
  markPrice: number;
  pnl: number;
  leverage: number;
  liquidationPrice: number;
  margin: number;
};

export type PredictionMockTransaction = {
  id: number;
  timestamp: number;
  type: "deposit" | "withdraw" | "settlement";
  asset: string;
  amount: number;
  status: "completed" | "pending";
};

export type PredictionChartPoint = {
  price: number;
  timestamp: number;
};

export type PredictionOrderBookLevel = {
  price: number;
  quantity: number;
};

export const CHART_WINDOW_MS = 65 * 1_000;
export const INITIAL_BALANCE = 1_000;
export const INITIAL_BTC_PRICE = 64_280.4;
export const INITIAL_ROUND = 1_787_541_000;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
