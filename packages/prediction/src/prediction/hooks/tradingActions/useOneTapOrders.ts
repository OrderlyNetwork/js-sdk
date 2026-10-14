import { useCallback, useMemo } from "react";
import type { BinaryInfoRow } from "../../binary/binaryInfo";
import {
  binaryUpNotional,
  estimateBinarySlippage,
  parseSlippageTicks,
  quoteToBinaryQuantity,
  resolveBinaryOrderLimits,
} from "../../binary/binaryOrderRules";
import type { BinaryOrderBook } from "../../binary/useBinaryOrderbook";
import type {
  OneTapBlockReason,
  PredictionOutcome,
} from "../../prediction.types";
import type { OrderSubmission } from "./useOrderSubmission";
import type { TradingEstimates } from "./useTradingEstimates";

export type OneTapOrdersArgs = {
  protectionPrice: TradingEstimates["protectionPrice"];
  isOrderTradable: TradingEstimates["isOrderTradable"];
  estimateAdditionalFrozen: TradingEstimates["estimateAdditionalFrozen"];
  submitOrder: OrderSubmission["submitOrder"];
  isSubmitting: boolean;
  book: BinaryOrderBook;
  slippage: string;
  notify: (message: string, tone?: "success" | "danger") => void;
  /** Symbol of the selected round. */
  selectedSymbol: string | undefined;
  selectedConfig: BinaryInfoRow | undefined;
  balance: number;
  accountReady: boolean;
  hasFeeConfig: boolean;
  isRegionRestricted: boolean;
  onActiveTab: (
    tab: "openOrders" | "predictions" | "orderHistory" | "predictionHistory",
  ) => void;
};

export interface OneTapOrderEvaluation {
  displayPrice: number | undefined;
  quantity: number;
  requiredFrozen: number | undefined;
  estimatedSlippage: number | null;
  blockReason: OneTapBlockReason | undefined;
  canPlace: boolean;
}

export const useOneTapOrders = ({
  protectionPrice,
  isOrderTradable,
  estimateAdditionalFrozen,
  submitOrder,
  isSubmitting,
  book,
  slippage,
  notify,
  selectedSymbol,
  selectedConfig,
  balance,
  accountReady,
  hasFeeConfig,
  isRegionRestricted,
  onActiveTab,
}: OneTapOrdersArgs) => {
  const limits = useMemo(
    () => resolveBinaryOrderLimits(selectedConfig ?? {}),
    [selectedConfig],
  );
  /**
   * Evaluate one IOC preset once for its preview, disabled state and notice.
   * Sizing uses the protection price; notional stays in UP coordinates and
   * depth uses the chosen outcome. Submission evaluates again before sending.
   */
  const evaluateOneTapOrder = useCallback(
    (
      outcome: PredictionOutcome,
      quoteAmount: number,
    ): OneTapOrderEvaluation => {
      const displayPrice = protectionPrice(outcome, "buy");
      const quantity =
        displayPrice == null
          ? 0
          : quoteToBinaryQuantity(quoteAmount, displayPrice, limits.baseTick);
      const levels =
        outcome === "up"
          ? { asks: book.asks, bids: book.bids }
          : { asks: book.downAsks, bids: book.downBids };
      const estimatedSlippage = estimateBinarySlippage(
        "buy",
        quantity,
        levels,
        limits.quoteTick,
      );
      let requiredFrozen: number | undefined;
      const blockReason = (() => {
        if (displayPrice == null)
          return "prediction.message.noExecutableQuotes";
        if (!isOrderTradable(selectedSymbol))
          return "prediction.message.roundNotTradable";
        if (isRegionRestricted) return "prediction.message.regionRestricted";
        if (!accountReady || !hasFeeConfig)
          return "prediction.message.orderFailed";
        if (!Number.isFinite(quoteAmount) || quoteAmount <= 0 || quantity <= 0)
          return "prediction.invalidOrder";
        requiredFrozen = estimateAdditionalFrozen(
          outcome,
          quantity,
          displayPrice,
        );
        if (requiredFrozen == null || requiredFrozen > balance)
          return "prediction.message.insufficientBalance";
        if (
          !binaryUpNotional(quantity, outcome, displayPrice).gte(
            limits.minNotional,
          )
        )
          return "prediction.invalidOrder";
        // An in-flight submission disables presets without a transient notice.
        if (isSubmitting) return undefined;
        if (estimatedSlippage == null)
          return "prediction.message.noExecutableQuotes";
        if (estimatedSlippage > (parseSlippageTicks(slippage) ?? -1))
          return "prediction.message.slippageExceeded";
        return undefined;
      })();
      return {
        displayPrice,
        quantity,
        requiredFrozen,
        estimatedSlippage,
        blockReason,
        canPlace: !isSubmitting && blockReason == null,
      };
    },
    [
      accountReady,
      balance,
      estimateAdditionalFrozen,
      hasFeeConfig,
      isSubmitting,
      isOrderTradable,
      isRegionRestricted,
      limits,
      book,
      slippage,
      protectionPrice,
      selectedSymbol,
    ],
  );
  const placeOneTapOrder = useCallback(
    async (
      outcome: PredictionOutcome,
      quoteAmount: number,
      clearNotification: () => void,
    ) => {
      const evaluation = evaluateOneTapOrder(outcome, quoteAmount);
      if (evaluation.blockReason != null) {
        notify(evaluation.blockReason, "danger");
        return;
      }
      if (!evaluation.canPlace || evaluation.displayPrice == null) return;
      clearNotification();
      const placed = await submitOrder({
        symbol: selectedSymbol,
        outcome,
        side: "buy",
        type: "market",
        displayPrice: evaluation.displayPrice,
        quantity: evaluation.quantity,
        reduceOnly: false,
      });
      if (!placed) return;
      onActiveTab("predictions");
    },
    [evaluateOneTapOrder, notify, onActiveTab, selectedSymbol, submitOrder],
  );
  return {
    evaluateOneTapOrder,
    placeOneTapOrder,
  };
};

export type OneTapOrders = ReturnType<typeof useOneTapOrders>;
