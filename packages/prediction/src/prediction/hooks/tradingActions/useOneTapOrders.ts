import { useCallback } from "react";
import { Decimal } from "@orderly.network/utils";
import type { BinaryInfoRow } from "../../binary/binaryInfo";
import { quoteToBinaryQuantity } from "../../binary/binaryOrderRules";
import type { PredictionOutcome } from "../../prediction.types";
import type { OrderSubmission } from "./useOrderSubmission";
import type { TradingEstimates } from "./useTradingEstimates";

export type OneTapOrdersArgs = {
  protectionPrice: TradingEstimates["protectionPrice"];
  isOrderTradable: TradingEstimates["isOrderTradable"];
  estimateAdditionalFrozen: TradingEstimates["estimateAdditionalFrozen"];
  submitOrder: OrderSubmission["submitOrder"];
  isSubmitting: boolean;
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

export const useOneTapOrders = ({
  protectionPrice,
  isOrderTradable,
  estimateAdditionalFrozen,
  submitOrder,
  isSubmitting,
  selectedSymbol,
  selectedConfig,
  balance,
  accountReady,
  hasFeeConfig,
  isRegionRestricted,
  onActiveTab,
}: OneTapOrdersArgs) => {
  /**
   * Size on the submitted IOC protection price, floored to the base tick.
   */
  const oneTapPayout = useCallback(
    (outcome: PredictionOutcome, quoteAmount: number) => {
      if (!Number.isFinite(quoteAmount) || quoteAmount <= 0) return 0;
      const price = protectionPrice(outcome, "buy");
      return price == null
        ? 0
        : quoteToBinaryQuantity(
            quoteAmount,
            price,
            selectedConfig?.base_tick ?? 0.01,
          );
    },
    [protectionPrice, selectedConfig],
  );
  /**
   * First failing one-tap gate as an i18n key, mirroring
   * canPlaceOneTapOrder minus the transient isSubmitting flag (a preset
   * blocked only by an in-flight submission shows no reason). Undefined
   * means placeable as far as this layer is concerned.
   */
  const oneTapBlockReason = useCallback(
    (outcome: PredictionOutcome, quoteAmount: number): string | undefined => {
      const price = protectionPrice(outcome, "buy");
      if (price == null) return "prediction.message.noExecutableQuotes";
      if (!isOrderTradable(selectedSymbol))
        return "prediction.message.roundNotTradable";
      if (isRegionRestricted) return "prediction.message.regionRestricted";
      if (!accountReady || !hasFeeConfig)
        return "prediction.message.orderFailed";
      if (!Number.isFinite(quoteAmount) || quoteAmount <= 0)
        return "prediction.invalidOrder";
      const quantity = oneTapPayout(outcome, quoteAmount);
      // A positive amount that floors below one base tick is an invalid
      // size, not a missing quote.
      if (quantity <= 0) return "prediction.invalidOrder";
      const requiredFrozen = estimateAdditionalFrozen(outcome, quantity, price);
      if (requiredFrozen == null || requiredFrozen > balance)
        return "prediction.message.insufficientBalance";
      // min_notional on the UP-book protection price (api-spec §5.2).
      const upNotional = new Decimal(quantity).mul(
        outcome === "up" ? price : new Decimal(1).sub(price).toNumber(),
      );
      if (!upNotional.gte(selectedConfig?.min_notional ?? 5))
        return "prediction.invalidOrder";
      return undefined;
    },
    [
      accountReady,
      balance,
      estimateAdditionalFrozen,
      hasFeeConfig,
      isOrderTradable,
      isRegionRestricted,
      oneTapPayout,
      protectionPrice,
      selectedConfig,
      selectedSymbol,
    ],
  );
  /**
   * One-tap gate priced entirely on the submitted protection price: the
   * live protection prices already include the user's slippage setting
   * (PRD §6.4). Empty executable sides cannot trade. Book-depth
   * gating composes in the script layer via estimateOrderSlippage.
   */
  const canPlaceOneTapOrder = useCallback(
    (outcome: PredictionOutcome, quoteAmount: number) => {
      const price = protectionPrice(outcome, "buy");
      if (price == null) return false;
      const quantity = oneTapPayout(outcome, quoteAmount);
      const requiredFrozen = estimateAdditionalFrozen(outcome, quantity, price);
      // min_notional on the UP-book protection price (api-spec §5.2): for
      // DOWN this is (1-n)*qty.
      const upNotional = new Decimal(quantity).mul(
        outcome === "up" ? price : new Decimal(1).sub(price).toNumber(),
      );
      // Only incremental opening risk requires additional free collateral.
      return (
        isOrderTradable(selectedSymbol) &&
        !isRegionRestricted &&
        accountReady &&
        hasFeeConfig &&
        !isSubmitting &&
        Number.isFinite(quoteAmount) &&
        quoteAmount > 0 &&
        requiredFrozen != null &&
        requiredFrozen <= balance &&
        quantity > 0 &&
        upNotional.gte(selectedConfig?.min_notional ?? 5)
      );
    },
    [
      balance,
      estimateAdditionalFrozen,
      accountReady,
      hasFeeConfig,
      isSubmitting,
      isRegionRestricted,
      isOrderTradable,
      selectedSymbol,
      oneTapPayout,
      protectionPrice,
      selectedConfig,
    ],
  );
  const placeOneTapOrder = useCallback(
    async (
      outcome: PredictionOutcome,
      quoteAmount: number,
      clearNotification: () => void,
    ) => {
      if (!canPlaceOneTapOrder(outcome, quoteAmount)) return;
      const price = protectionPrice(outcome, "buy");
      if (price == null) return;
      const quantity = oneTapPayout(outcome, quoteAmount);
      clearNotification();
      const placed = await submitOrder({
        symbol: selectedSymbol,
        outcome,
        side: "buy",
        type: "market",
        displayPrice: price,
        quantity,
        reduceOnly: false,
      });
      if (!placed) return;
      onActiveTab("predictions");
    },
    [
      canPlaceOneTapOrder,
      onActiveTab,
      oneTapPayout,
      protectionPrice,
      selectedSymbol,
      submitOrder,
    ],
  );
  return {
    oneTapPayout,
    oneTapBlockReason,
    canPlaceOneTapOrder,
    placeOneTapOrder,
  };
};

export type OneTapOrders = ReturnType<typeof useOneTapOrders>;
