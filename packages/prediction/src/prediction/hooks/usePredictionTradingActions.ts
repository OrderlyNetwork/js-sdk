import { useMemo, useRef } from "react";
import { useRefreshOrderCaches } from "@orderly.network/hooks";
import type { BinaryInfoRow } from "../binary/binaryInfo";
import { useBinaryFeeRates } from "../binary/useBinaryFeeRates";
import type { BinaryOrderBook } from "../binary/useBinaryOrderbook";
import { useOneTapOrders } from "./tradingActions/useOneTapOrders";
import { useOrderCancellation } from "./tradingActions/useOrderCancellation";
import { useOrderSubmission } from "./tradingActions/useOrderSubmission";
import { useTradingEstimates } from "./tradingActions/useTradingEstimates";
import type { PredictionAccountResources } from "./usePredictionAccountResources";

export { toPredictionOrder } from "../binary/binaryOrderDisplay";
export { ISO_ORDER_FROZEN_BUFFER } from "../binary/binaryCollateral";
export type { PlaceOrderInput } from "./tradingActions/useOrderSubmission";
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
 * is the public contract (see PredictionAccountActions/PredictionAccountState
 * Picks) — keep its shape field-for-field.
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
  const configBySymbol = useMemo(
    () => new Map(binaryRows.map((row) => [row.symbol, row])),
    [binaryRows],
  );
  const selectedConfig = selectedSymbol
    ? configBySymbol.get(selectedSymbol)
    : undefined;
  const feeRates = useBinaryFeeRates();
  const hasFeeConfig = feeRates.takerRate != null && feeRates.makerRate != null;
  const { accountState, accountReady } = resources;
  const refreshOrders = useRefreshOrderCaches();
  // Shared unmount guard for async continuations; the mount/unmount effect
  // lives in useOrderCancellation, submission only reads the flag.
  const bulkCancellationMounted = useRef(true);
  const estimates = useTradingEstimates({
    resources,
    active,
    configBySymbol,
    selectedSymbol,
    bbo,
    slippage,
    feeRates,
    hasFeeConfig,
  });
  const submission = useOrderSubmission({
    resources,
    active,
    notify,
    isRegionRestricted,
    selectedSymbol,
    selectedConfig,
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
    maxOpeningQuantity: estimates.maxOpeningQuantity,
    protectionPrice: estimates.protectionPrice,
    isOrderTradable: estimates.isOrderTradable,
  });
  const cancellation = useOrderCancellation({
    resources,
    notify,
    isRegionRestricted,
    selectedSymbol,
    isOrderTradable: estimates.isOrderTradable,
    refreshOrders,
    bulkCancellationMounted,
  });
  const oneTap = useOneTapOrders({
    protectionPrice: estimates.protectionPrice,
    isOrderTradable: estimates.isOrderTradable,
    estimateAdditionalFrozen: estimates.estimateAdditionalFrozen,
    submitOrder: submission.submitOrder,
    isSubmitting: submission.isSubmitting,
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
    editPendingOrder: submission.editPendingOrder,
    placeOrder: submission.placeOrder,
    oneTapPayout: oneTap.oneTapPayout,
    canPlaceOneTapOrder: oneTap.canPlaceOneTapOrder,
    oneTapBlockReason: oneTap.oneTapBlockReason,
    placeOneTapOrder: oneTap.placeOneTapOrder,
    cancelOrder: cancellation.cancelOrder,
    cancelAllOrders: cancellation.cancelAllOrders,
    feeRates,
    estimateFee: estimates.estimateFee,
    estimateFrozen: estimates.estimateFrozen,
  };
};
