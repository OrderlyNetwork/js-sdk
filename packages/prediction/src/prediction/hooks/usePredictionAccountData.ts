import { type LocaleMessages, i18n } from "@orderly.network/i18n";
import { toast } from "@orderly.network/ui";
import { EMPTY_BOOK } from "../binary/useBinaryOrderbook";
import { useBinaryRegionRestricted } from "../binary/useBinaryRegion";
import type { PredictionAccountState } from "../prediction.types";
import { usePredictionAccountResources } from "./usePredictionAccountResources";
import { usePredictionMarkets } from "./usePredictionMarkets";
import { usePredictionTradingActions } from "./usePredictionTradingActions";

const notify = (message: string, tone?: "success" | "danger") =>
  tone === "success"
    ? toast.success(String(i18n.t(message as keyof LocaleMessages)))
    : toast.error(String(i18n.t(message as keyof LocaleMessages)));
const onActiveTab = () => {};
const NO_QUOTES = { bestAsk: undefined, bestBid: undefined };
/** Account panels share SDK streams and bound query mutations, without page state or market subscriptions. */
export const usePredictionAccountData = ({
  enabled = true,
  includeHistory = true,
}: {
  enabled?: boolean;
  includeHistory?: boolean;
} = {}): PredictionAccountState => {
  const markets = usePredictionMarkets({ enabled });
  const resources = usePredictionAccountResources({
    enabled,
    includeHistory,
    nowMs: markets.now,
  });
  const isRegionRestricted = useBinaryRegionRestricted(enabled);
  const actions = usePredictionTradingActions({
    resources,
    binaryRows: markets.rows,
    active: enabled,
    isRegionRestricted,
    selectedSymbol: undefined,
    bbo: NO_QUOTES,
    slippage: "2",
    book: EMPTY_BOOK,
    onActiveTab,
    notify,
  });
  return {
    accountId: actions.accountId,
    accountReady: actions.accountReady,
    ordersLoading: resources.ordersLoading,
    ordersError: resources.ordersError,
    positionsLoading: resources.positionsLoading,
    positionsError: resources.positionsError,
    balance: actions.balance,
    positions: actions.positions,
    openOrders: actions.openOrders,
    pendingOrdersComplete: actions.pendingOrdersComplete,
    history: actions.history,
    settlements: actions.settlements,
    historyRecords: actions.historyRecords,
    historyCompleteness: actions.historyCompleteness,
    historyLoading: actions.historyLoading,
    historyError: actions.historyError,
    pendingSettlementSymbols: actions.pendingSettlementSymbols,
    availableQuantity: actions.availableQuantity,
    hasFeeConfig: actions.hasFeeConfig,
    isSubmitting: actions.isSubmitting,
    isOrderTradable: actions.isOrderTradable,
    cancelOrder: actions.cancelOrder,
    cancelAllOrders: actions.cancelAllOrders,
    editPendingOrder: actions.editPendingOrder,
    estimateFee: actions.estimateFee,
    estimateFrozen: actions.estimateFrozen,
    feeRates: actions.feeRates,
    isRegionRestricted,
  };
};
