import type { BinaryInfoRow } from "../binary/binaryInfo";
import type { BinaryOrderBook } from "../binary/useBinaryOrderbook";
import { useOneTapOrders } from "./tradingActions/useOneTapOrders";
import { useOrderSubmission } from "./tradingActions/useOrderSubmission";
import { useTradingEstimates } from "./tradingActions/useTradingEstimates";
import { usePredictionAccountActions } from "./usePredictionAccountActions";
import type { PredictionAccountResources } from "./usePredictionAccountResources";

export type UsePredictionTradingActionsArgs = {
  resources: PredictionAccountResources;
  active?: boolean;
  binaryRows: BinaryInfoRow[];
  notify: (message: string, tone?: "success" | "danger") => void;
  isRegionRestricted: boolean;
  /** Symbol of the selected round. */
  selectedSymbol: string | undefined;
  /** UP-coordinates BBO of the selected round's book. */
  bbo: {
    bestAsk: number | undefined;
    bestBid: number | undefined;
  };
  /** Maximum absolute price movement in quote ticks. */
  slippage: string;
  book: BinaryOrderBook;
  onActiveTab: (
    tab: "openOrders" | "predictions" | "orderHistory" | "predictionHistory",
  ) => void;
};
/**
 * Composition root for prediction trading behavior: estimators, the order
 * submission engine, cancellations, and one-tap orders. The returned object
 * is internal; account consumers use explicit account interfaces.
 */
export const usePredictionTradingActions = ({
  resources,
  active = true,
  binaryRows,
  notify,
  isRegionRestricted,
  selectedSymbol,
  bbo,
  slippage,
  book,
  onActiveTab,
}: UsePredictionTradingActionsArgs) => {
  const account = usePredictionAccountActions({
    resources,
    binaryRows,
    active,
    selectedSymbol,
    isRegionRestricted,
    notify,
  });
  const {
    configBySymbol,
    feeRates,
    hasFeeConfig,
    refreshOrders,
    bulkCancellationMounted,
  } = account;
  const selectedConfig = selectedSymbol
    ? configBySymbol.get(selectedSymbol)
    : undefined;
  const { accountState, accountReady } = resources;
  const estimates = useTradingEstimates({
    accountEstimates: account.estimates,
    configBySymbol,
    selectedSymbol,
    bbo,
    slippage,
  });
  const submission = useOrderSubmission({
    resources,
    active,
    notify,
    isRegionRestricted,
    selectedSymbol,
    bbo,
    slippage,
    book,
    onActiveTab,
    configBySymbol,
    hasFeeConfig,
    refreshOrders,
    bulkCancellationMounted,
    availableQuantity: estimates.availableQuantity,
    estimateAdditionalFrozen: estimates.estimateAdditionalFrozen,
    protectionPrice: estimates.protectionPrice,
    isOrderTradable: estimates.isOrderTradable,
  });
  const oneTap = useOneTapOrders({
    protectionPrice: estimates.protectionPrice,
    isOrderTradable: estimates.isOrderTradable,
    estimateAdditionalFrozen: estimates.estimateAdditionalFrozen,
    submitOrder: submission.submitOrder,
    isSubmitting: submission.isSubmitting,
    book,
    slippage,
    notify,
    selectedSymbol,
    selectedConfig,
    balance: resources.balance,
    accountReady,
    hasFeeConfig,
    isRegionRestricted,
    onActiveTab,
  });
  const {
    balance,
    positions,
    openOrders,
    pendingOrdersComplete,
    history,
    settlements,
    historyRecords,
    historyCompleteness,
    historyLoading,
    historyError,
    pendingSettlementSymbols,
  } = resources;
  return {
    ordersLoading: resources.ordersLoading,
    ordersError: resources.ordersError,
    positionsLoading: resources.positionsLoading,
    positionsError: resources.positionsError,
    balance,
    fundingEstimateMode: estimates.fundingEstimateMode,
    estimateAdditionalFrozen: estimates.estimateAdditionalFrozen,
    maxOpeningQuantity: estimates.maxOpeningQuantity,
    positions,
    openOrders,
    pendingOrdersComplete,
    history,
    settlements,
    historyRecords,
    historyCompleteness,
    historyLoading,
    historyError,
    pendingSettlementSymbols,
    accountId: accountReady ? accountState.accountId : undefined,
    availableQuantity: estimates.availableQuantity,
    /**
     * Fail-closed gate: with no valid binary fee config the account must not
     * trade through this UI (missing config is never "free", api-spec §6.4).
     */
    hasFeeConfig,
    accountReady,
    isSubmitting: submission.isSubmitting,
    isOrderTradable: estimates.isOrderTradable,
    protectionPrice: estimates.protectionPrice,
    sellPosition: submission.sellPosition,
    editPendingOrder: account.actions.editPendingOrder,
    placeOrder: submission.placeOrder,
    evaluateOneTapOrder: oneTap.evaluateOneTapOrder,
    oneTapPayout: oneTap.oneTapPayout,
    canPlaceOneTapOrder: oneTap.canPlaceOneTapOrder,
    oneTapBlockReason: oneTap.oneTapBlockReason,
    placeOneTapOrder: oneTap.placeOneTapOrder,
    cancelOrder: account.actions.cancelOrder,
    cancelAllOrders: account.actions.cancelAllOrders,
    feeRates,
    estimateFee: estimates.estimateFee,
    estimateFrozen: estimates.estimateFrozen,
  };
};
