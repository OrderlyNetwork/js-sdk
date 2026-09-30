export type PredictionOutcome = "up" | "down";
export type PredictionOrderSide = "buy" | "sell";
export type PredictionOrderType = "market" | "limit";
export type PredictionAmountUnit = "quote" | "outcome";
export type PredictionRoundPhase =
  | "trading"
  | "closingSoon"
  | "closed"
  | "resolvedUp"
  | "resolvedDown";
export type PredictionDataTab =
  | "openOrders"
  | "predictions"
  | "assets"
  | "orderHistory"
  | "filled"
  | "predictionHistory"
  | "history";

export type PredictionNotification = {
  id: number;
  message: string;
  tone: "success" | "danger";
};

export type PredictionPosition = {
  outcome: PredictionOutcome;
  quantity: number;
  averagePrice: number;
  /** Round-specific binary symbol of the position. */
  symbol?: string;
  /** Round start (epoch seconds) of the position's round. */
  round?: number;
};

export type PredictionOpenOrder = {
  id: number;
  /** UP-book side badge: BUY = UP side, SELL = DOWN side (TASK-22 mapping). */
  outcome: PredictionOutcome;
  side: PredictionOrderSide;
  type: PredictionOrderType;
  /** UP-book price. */
  price: number;
  quantity: number;
  /** Executed quantity so far (backend total_executed_quantity); 0 while resting. */
  filledQuantity: number;
  /** Average executed price in the UP coordinate, once partially filled. */
  averagePrice?: number;
  reduceOnly?: boolean;
  /** Round-specific binary symbol. */
  symbol?: string;
  round: number;
  timestamp: number;
  status?: "pending" | "partialFilled" | "filled" | "cancelled" | "rejected";
};

export type PredictionTrade = PredictionOpenOrder & {
  status: "filled" | "cancelled";
};

export type PredictionSettlement = {
  id: number;
  symbol?: string;
  round: number;
  outcome: PredictionOutcome;
  quantity: number;
  averagePrice: number;
  settlementPrice: number;
  result?: PredictionOutcome | "closed";
  payout: number;
  /**
   * Final net PnL; undefined while an expiry settlement is still pending
   * (settled_at null, api-spec §6.3 — do not present final numbers before it).
   */
  pnl?: number;
  /** Settlement (expiry) / close (early exit) time in epoch ms. */
  settledAt?: number;
  /** Expiry row whose system close has not completed yet. */
  settling?: boolean;
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

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);
