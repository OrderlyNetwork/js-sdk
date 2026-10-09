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
  /** Original API type, retained verbatim when editing. */
  orderType?: string;
  clientOrderId?: string;
  orderTag?: string;
  /** UP-book price. */
  price: number;
  quantity: number;
  /** Executed quantity so far (backend total_executed_quantity); 0 while resting. */
  filledQuantity: number;
  /** Average executed price in the UP coordinate, once partially filled. */
  averagePrice?: number;
  /** Historical confirmed fees, never recomputed from the current coefficient. */
  totalFee?: number;
  feeAsset?: string;
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

/** Narrow Binary cancellation capability, independent of any Prediction page. */
export type BinaryOrderCancellationCapability = {
  accountId?: string;
  accountReady: boolean;
  openOrders: PredictionOpenOrder[];
  pendingOrdersComplete: boolean;
  isRegionRestricted: boolean;
  isOrderTradable: (symbol?: string) => boolean;
};

/** Independent actions for account tables; trade forms own their market inputs. */
export type PredictionAccountActions = Pick<
  ReturnType<
    typeof import("./hooks/usePredictionTradingActions").usePredictionTradingActions
  >,
  | "availableQuantity"
  | "isOrderTradable"
  | "cancelOrder"
  | "cancelAllOrders"
  | "editPendingOrder"
  | "estimateFee"
  | "estimateFrozen"
>;

/** Account data and actions contain no selected round, chart, form or orderbook. */
export type PredictionAccountState = Pick<
  ReturnType<
    typeof import("./hooks/usePredictionTradingActions").usePredictionTradingActions
  >,
  | "accountId"
  | "accountReady"
  | "balance"
  | "positions"
  | "openOrders"
  | "pendingOrdersComplete"
  | "history"
  | "settlements"
  | "historyRecords"
  | "historyCompleteness"
  | "historyLoading"
  | "historyError"
  | "pendingSettlementSymbols"
  | "hasFeeConfig"
  | "isSubmitting"
  | "feeRates"
> &
  PredictionAccountActions & {
    isRegionRestricted: boolean;
    ordersLoading: boolean;
    ordersError?: unknown;
    positionsLoading: boolean;
    positionsError?: unknown;
  };

/** Only a mounted trading page supplies live valuation to account tables. */
export type PredictionHoldingsMarketView = {
  selectedRow?: import("./binary/binaryInfo").BinaryInfoDetail;
  outcomePrices: Record<PredictionOutcome, number | undefined>;
  round?: number;
  roundPhase: PredictionRoundPhase;
  isRoundTradable: boolean;
};
export type PredictionAccountPanelState = PredictionAccountState & {
  activeTab?: PredictionDataTab;
  setActiveTab?: (tab: PredictionDataTab) => void;
  marketView?: PredictionHoldingsMarketView;
};
