import type { API } from "@orderly.network/types";
import type { BinaryHistoryRecord } from "./binary/binaryHistory";
import type { BinaryFeeRates } from "./binary/useBinaryFeeRates";
import type { BinaryCancelAllOptions } from "./dataPanels/productOrderCancellation";

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
  /** Round start in epoch seconds. */
  round: number;
  /** Order creation time in epoch milliseconds. */
  timestamp: number;
  status?: "pending" | "partialFilled" | "filled" | "cancelled" | "rejected";
};

export type PredictionTrade = PredictionOpenOrder & {
  status: "filled" | "cancelled" | "rejected";
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

/** Narrow Binary cancellation capability, independent of any Prediction page. */
export type BinaryOrderCancellationCapability = {
  accountId?: string;
  accountReady: boolean;
  openOrders: PredictionOpenOrder[];
  pendingOrdersComplete: boolean;
  isRegionRestricted: boolean;
  isOrderTradable: (symbol?: string) => boolean;
};

/** Explicit account capabilities; prices passed to editing/fees use UP coordinates. */
export interface PredictionAccountActions {
  availableQuantity(
    outcome: PredictionOutcome,
    excludeId?: number,
    symbol?: string,
  ): number;
  isOrderTradable(symbol?: string): boolean;
  cancelOrder(id: number, symbol?: string): Promise<void>;
  cancelAllOrders(options?: BinaryCancelAllOptions): Promise<boolean>;
  editPendingOrder(
    id: number,
    upPrice: number,
    totalQuantity: number,
  ): Promise<boolean>;
  estimateFee(
    quantity: number,
    upPrice: number,
    taker: boolean,
  ): number | undefined;
}

export interface PredictionSettlementHistoryState {
  settlements: PredictionSettlement[];
  historyRecords: BinaryHistoryRecord[];
  historyLoading: boolean;
  historyError?: unknown;
  pendingSettlementSymbols: string[];
}

/** Account data has no selected market, order form, chart or orderbook. */
export interface PredictionAccountState
  extends PredictionAccountActions, PredictionSettlementHistoryState {
  accountId?: string;
  accountReady: boolean;
  balance: number;
  positions: PredictionPosition[];
  openOrders: PredictionOpenOrder[];
  pendingOrdersComplete: boolean;
  history: PredictionTrade[];
  hasFeeConfig: boolean;
  isSubmitting: boolean;
  feeRates: BinaryFeeRates;
  isRegionRestricted: boolean;
  ordersLoading: boolean;
  ordersError?: unknown;
  positionsLoading: boolean;
  positionsError?: unknown;
}

export interface UsePredictionAccountDataOptions {
  /** Enable this consumer's resources; true by default. */
  enabled?: boolean;
  /** Load terminal orders; false by default. Display tables own their pagination. */
  includeOrderHistory?: boolean;
  /** Request history for display; pending personal settlements are also tracked automatically. */
  includeSettlementHistory?: boolean;
}

export interface UsePredictionMarketsOptions {
  enabled?: boolean;
}
export interface PredictionMarket {
  /** Market family ID, e.g. `PERP_BTC5M_USDC`, shared across rounds; not a tradable round symbol. */
  id: string;
  base: string;
  quote: string;
  period: string;
  intervalSeconds: number;
  indexPriceSymbol: string;
  currentRow: API.BinaryInfoRow;
  /** False when every snapshot round has expired or been delisted; history stays browsable. */
  hasLiveRow: boolean;
}
export interface PredictionMarketsState {
  rows: API.BinaryInfoRow[];
  markets: PredictionMarket[];
  /** Server-calibrated epoch milliseconds, updated at round boundaries. */
  now: number;
  error?: unknown;
  isLoading: boolean;
  configBySymbol: Map<string, API.BinaryInfoRow>;
  isOrderTradable(symbol?: string): boolean;
}

/** Only a mounted trading page supplies live valuation to account tables. */
export type PredictionHoldingsMarketView = {
  selectedRow?: API.BinaryInfoRow;
  outcomePrices: Record<PredictionOutcome, number | undefined>;
  round?: number;
  roundPhase: PredictionRoundPhase;
  isRoundTradable: boolean;
};
export interface PredictionAccountPanelState extends PredictionAccountState {
  activeTab?: PredictionDataTab;
  setActiveTab?: (tab: PredictionDataTab) => void;
  marketView?: PredictionHoldingsMarketView;
}

/** Selected Prediction round contract. */
export type PredictionSymbolSelection = {
  symbol: string;
};
