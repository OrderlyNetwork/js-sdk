import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  useMutation,
  type useRefreshOrderCaches,
} from "@orderly.network/hooks";
import { i18n } from "@orderly.network/i18n";
import { OrderType } from "@orderly.network/types";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import { estimateBinaryOrderFrozen } from "../../binary/binaryCollateral";
import { isBinaryRowTradable } from "../../binary/binaryInfo";
import type { BinaryInfoRow } from "../../binary/binaryInfo";
import { binaryOrderEditPayload } from "../../binary/binaryOrderDisplay";
import {
  binaryProtectionPrice,
  binaryRejectionNotice,
  binarySubmissionNotice,
  estimateBinarySlippage,
  isBinaryMarketBatchAllowed,
  parseSlippageTicks,
  splitBinaryQuantity,
  submitBinaryBatches,
  toBinaryUpRequest,
} from "../../binary/binaryOrderRules";
import type { BinaryOrderBook } from "../../binary/useBinaryOrderbook";
import type {
  PredictionOutcome,
  PredictionOrderSide,
  PredictionOrderType,
} from "../../prediction.types";
import { floorToTickDecimal } from "../../predictionShared";
import type { PredictionAccountResources } from "../usePredictionAccountResources";
import type { TradingEstimates } from "./useTradingEstimates";

export type PlaceOrderInput = {
  canPlaceOrder: boolean;
  orderSide: PredictionOrderSide;
  orderType: PredictionOrderType;
  selectedOutcome: PredictionOutcome;
  selectedPrice: number;
  orderQuantity: number;
  onResetAmountAfterFill: () => void;
  clearNotification: () => void;
};
export type OrderSubmissionArgs = {
  resources: PredictionAccountResources;
  active: boolean;
  notify: (message: string, tone?: "success" | "danger") => void;
  isRegionRestricted: boolean;
  /** Symbol of the selected round. */
  selectedSymbol: string | undefined;
  selectedConfig: BinaryInfoRow | undefined;
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
  configBySymbol: Map<string, BinaryInfoRow>;
  hasFeeConfig: boolean;
  refreshOrders: ReturnType<typeof useRefreshOrderCaches>;
  /** Shared unmount guard; false stops async continuations mid-flight. */
  bulkCancellationMounted: MutableRefObject<boolean>;
  availableQuantity: TradingEstimates["availableQuantity"];
  estimateAdditionalFrozen: TradingEstimates["estimateAdditionalFrozen"];
  maxOpeningQuantity: TradingEstimates["maxOpeningQuantity"];
  protectionPrice: TradingEstimates["protectionPrice"];
  isOrderTradable: TradingEstimates["isOrderTradable"];
};
// decimal.js-light has no floor(); the shared core keeps sizing and
// submission exactly aligned (see predictionShared.floorToTickDecimal).
const toTickQuantity = (quantity: number, tick: number) =>
  floorToTickDecimal(quantity, tick).toString();
/**
 * UP-book request coordinates from the user's outcome view (api-spec §5.2):
 * buying DOWN @n is SELL UP @(1-n); selling a DOWN position (closing a short)
 * is BUY UP @(1-n).
 */
const toUpBookRequest = toBinaryUpRequest;
const toDisplayPrice = (upPrice: number) =>
  new Decimal(1).sub(upPrice).toNumber();
// The UI renders notification messages through i18next `t()`, which passes
// unknown keys through verbatim, so raw backend rejection text displays as-is
// (untranslated); only messages without any backend text fall back to the key.
const rejectionNotice = binaryRejectionNotice;
export const useOrderSubmission = ({
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
  availableQuantity,
  estimateAdditionalFrozen,
  maxOpeningQuantity,
  protectionPrice,
  isOrderTradable,
}: OrderSubmissionArgs) => {
  const { accountState, accountReady } = resources;
  const {
    balance,
    openOrders,
    getCollateralSnapshot,
    pendingOrdersStream,
    allOrdersStream,
    refreshAccountPositions,
  } = resources;
  const submitting = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const live = useRef({
    accountReady: active && accountReady,
    accountId: accountState.accountId,
    hasFeeConfig,
    isRegionRestricted,
    configBySymbol,
    selectedSymbol,
    bbo,
    book,
    slippage,
  });
  useLayoutEffect(() => {
    live.current = {
      accountReady: active && accountReady,
      accountId: accountState.accountId,
      hasFeeConfig,
      isRegionRestricted,
      configBySymbol,
      selectedSymbol,
      bbo,
      book,
      slippage,
    };
  }, [
    active,
    accountReady,
    accountState.accountId,
    hasFeeConfig,
    isRegionRestricted,
    configBySymbol,
    selectedSymbol,
    bbo,
    book,
    slippage,
  ]);
  const liveFunds = useRef({
    balance,
    getCollateralSnapshot,
    availableQuantity,
  });
  useLayoutEffect(() => {
    liveFunds.current = { balance, getCollateralSnapshot, availableQuantity };
  }, [balance, getCollateralSnapshot, availableQuantity]);
  const [doCreateOrder] = useMutation("/v1/order", "POST");
  const [doCreateBatchOrder] = useMutation("/v1/batch-order", "POST");
  const [doUpdateOrder] = useMutation("/v1/order", "PUT");
  const submitOrder = useCallback(
    async (input: {
      symbol: string | undefined;
      outcome: PredictionOutcome;
      side: PredictionOrderSide;
      type: PredictionOrderType;
      displayPrice: number;
      quantity: number;
      reduceOnly: boolean;
      failureFallback?: "prediction.message.sellFailed";
    }): Promise<boolean> => {
      const {
        symbol,
        outcome,
        side,
        type,
        displayPrice,
        quantity,
        reduceOnly,
        failureFallback,
      } = input;
      if (!symbol) {
        notify(failureFallback ?? "prediction.message.orderFailed", "danger");
        return false;
      }
      const config = configBySymbol.get(symbol);
      if (
        !config ||
        !active ||
        !accountReady ||
        !hasFeeConfig ||
        isRegionRestricted ||
        !isBinaryRowTradable(config, getTimestamp()) ||
        submitting.current
      ) {
        notify(failureFallback ?? "prediction.message.orderFailed", "danger");
        return false;
      }
      if (
        !Number.isFinite(displayPrice) ||
        displayPrice <= 0 ||
        displayPrice >= 1 ||
        !Number.isFinite(quantity) ||
        quantity < (config.base_min ?? config.base_tick ?? 0.01)
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      const { upSide, upPrice } = toUpBookRequest(outcome, side, displayPrice);
      const quantities = splitBinaryQuantity(quantity, upPrice, config);
      const tick = config.quote_tick ?? 0.01;
      const levels =
        outcome === "up"
          ? { asks: book.asks, bids: book.bids }
          : { asks: book.downAsks, bids: book.downBids };
      const estimated = estimateBinarySlippage(
        side,
        quantity,
        {
          asks: levels.asks.map(([price, quantity]) => ({ price, quantity })),
          bids: levels.bids.map(([price, quantity]) => ({ price, quantity })),
        },
        tick,
      );
      const protection = binaryProtectionPrice(
        outcome,
        side,
        bbo,
        slippage,
        config,
      );
      if (
        !quantities ||
        !new Decimal(upPrice).div(tick).isInteger() ||
        (type === "market" &&
          (protection == null ||
            estimated == null ||
            parseSlippageTicks(slippage) == null ||
            estimated > parseSlippageTicks(slippage)! ||
            (side === "buy"
              ? new Decimal(displayPrice).gt(protection)
              : new Decimal(displayPrice).lt(protection))))
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      if (
        upPrice < (config.quote_min ?? config.quote_tick ?? 0.01) ||
        upPrice > (config.quote_max ?? 0.99)
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      // min_notional is validated on the UP-book price for both sides and
      // reduce-only exits alike (api-spec §5.2); reject early instead of
      // letting the server bounce the order.
      if (new Decimal(quantity).mul(upPrice).lt(config.min_notional ?? 5)) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      // Recheck the current protection price and snapshot immediately before
      // submission; a caller's canPlaceOrder flag may be stale.
      if (reduceOnly) {
        if (quantity > availableQuantity(outcome, undefined, symbol)) {
          notify("prediction.message.insufficientContracts", "danger");
          return false;
        }
      } else {
        const requiredFrozen = estimateAdditionalFrozen(
          outcome,
          quantity,
          displayPrice,
          symbol,
        );
        if (requiredFrozen == null || requiredFrozen > balance) {
          notify("prediction.message.insufficientBalance", "danger");
          return false;
        }
      }
      const orders = quantities.map((size) => ({
        symbol,
        side: upSide,
        order_type: type === "limit" ? OrderType.LIMIT : OrderType.IOC,
        order_price: new Decimal(upPrice).toFixed(
          new Decimal(tick).decimalPlaces(),
        ),
        order_quantity: toTickQuantity(size, config.base_tick ?? 0.01),
        margin_mode: "ISOLATED",
        ...(reduceOnly ? { reduce_only: true } : {}),
      }));
      let remainingQuantity = new Decimal(quantity);
      submitting.current = true;
      setIsSubmitting(true);
      try {
        const result = await submitBinaryBatches(
          orders,
          async (batch) => {
            const response = await (batch.length === 1
              ? doCreateOrder(batch[0])
              : doCreateBatchOrder({ orders: batch }));
            remainingQuantity = batch.reduce(
              (remaining, order) => remaining.sub(String(order.order_quantity)),
              remainingQuantity,
            );
            return response;
          },
          () => {
            const current = live.current;
            const row = current.configBySymbol.get(symbol);
            if (
              !bulkCancellationMounted.current ||
              !current.accountReady ||
              current.accountId !== accountState.accountId ||
              (type === "market" && current.selectedSymbol !== symbol) ||
              !current.hasFeeConfig ||
              current.isRegionRestricted ||
              !row ||
              !isBinaryRowTradable(row, getTimestamp())
            )
              return false;
            const funds = liveFunds.current;
            if (reduceOnly) {
              if (
                remainingQuantity.gt(
                  funds.availableQuantity(outcome, undefined, symbol),
                )
              )
                return false;
            } else {
              const pieces = splitBinaryQuantity(
                remainingQuantity.toNumber(),
                upPrice,
                row,
              );
              const frozen =
                pieces &&
                estimateBinaryOrderFrozen(
                  funds.getCollateralSnapshot(symbol),
                  upSide,
                  upPrice,
                  remainingQuantity.toNumber(),
                  pieces,
                );
              if (frozen == null || frozen.gt(funds.balance)) return false;
            }
            if (type === "limit") return true;
            return isBinaryMarketBatchAllowed({
              outcome,
              side,
              remainingQuantity: remainingQuantity.toNumber(),
              displayPrice,
              bbo: current.bbo,
              book: current.book,
              slippage: current.slippage,
              config: row,
            });
          },
        );
        if (result.error) {
          notify(
            binarySubmissionNotice(result, {
              batched: orders.length > 1,
              fallback: i18n.t(
                failureFallback ?? "prediction.message.orderFailed",
              ),
              batchSummary: i18n.t("prediction.message.batchResult", {
                accepted: result.accepted,
                failed: result.failed,
                unknown: result.unknown,
                unsent: result.unsent,
              }),
              unknownSummary: i18n.t("prediction.message.acceptanceUnknown"),
            }),
            "danger",
          );
        }
        // Refresh even on ambiguity. Never infer a fill from REST acceptance.
        if (live.current.accountId === accountState.accountId) {
          await Promise.allSettled([
            refreshOrders(accountState.accountId),
            refreshAccountPositions(),
          ]);
        }
        // Clear ambiguous input too, preventing accidental full resubmission.
        return result.accepted > 0 || result.unknown > 0;
      } finally {
        submitting.current = false;
        if (bulkCancellationMounted.current) setIsSubmitting(false);
      }
    },
    [
      active,
      accountReady,
      accountState.accountId,
      hasFeeConfig,
      isRegionRestricted,
      availableQuantity,
      balance,
      book,
      bbo,
      slippage,
      configBySymbol,
      doCreateOrder,
      doCreateBatchOrder,
      estimateAdditionalFrozen,
      notify,
      pendingOrdersStream.refresh,
      allOrdersStream.refresh,
      refreshAccountPositions,
      refreshOrders,
    ],
  );
  const placeOrder = useCallback(
    async ({
      canPlaceOrder,
      orderSide,
      orderType,
      selectedOutcome,
      selectedPrice,
      orderQuantity,
      onResetAmountAfterFill,
      clearNotification,
    }: PlaceOrderInput) => {
      clearNotification();
      if (!canPlaceOrder) {
        notify(
          orderSide === "buy"
            ? "prediction.message.insufficientBalance"
            : "prediction.message.insufficientContracts",
          "danger",
        );
        return;
      }
      const displayPrice =
        orderType === "limit"
          ? selectedPrice
          : protectionPrice(selectedOutcome, orderSide);
      if (displayPrice == null) {
        notify("prediction.message.orderFailed", "danger");
        return;
      }
      const placed = await submitOrder({
        symbol: selectedSymbol,
        outcome: selectedOutcome,
        side: orderSide,
        type: orderType,
        displayPrice,
        quantity: orderQuantity,
        reduceOnly: orderSide === "sell",
      });
      if (!placed) return;
      onResetAmountAfterFill();
      onActiveTab("openOrders");
    },
    [notify, onActiveTab, protectionPrice, selectedSymbol, submitOrder],
  );
  const sellPosition = useCallback(
    async (
      outcome: PredictionOutcome,
      quantity: number,
      type: PredictionOrderType,
      limit: number,
      symbol?: string,
    ): Promise<boolean> => {
      const targetSymbol = symbol ?? selectedSymbol;
      const price =
        type === "market"
          ? protectionPrice(outcome, "sell", targetSymbol)
          : limit;
      if (
        !isOrderTradable(targetSymbol) ||
        isRegionRestricted ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > availableQuantity(outcome, undefined, targetSymbol) ||
        price == null ||
        !Number.isFinite(price) ||
        price <= 0 ||
        price >= 1
      ) {
        notify("prediction.message.sellFailed", "danger");
        return false;
      }
      const placed = await submitOrder({
        symbol: targetSymbol,
        outcome,
        side: "sell",
        type,
        displayPrice: price,
        quantity,
        reduceOnly: true,
        failureFallback: "prediction.message.sellFailed",
      });
      if (!placed) return false;
      return true;
    },
    [
      availableQuantity,
      isRegionRestricted,
      isOrderTradable,
      notify,
      protectionPrice,
      selectedSymbol,
      submitOrder,
    ],
  );
  const editPendingOrder = useCallback(
    async (id: number, price: number, quantity: number): Promise<boolean> => {
      const order = openOrders.find((item) => item.id === id);
      const config = order?.symbol
        ? configBySymbol.get(order.symbol)
        : selectedConfig;
      // Every rejection must surface a reason; a silently no-oping edit
      // modal looks like a broken button.
      if (!config || !isBinaryRowTradable(config, getTimestamp())) {
        notify("prediction.message.roundNotTradable", "danger");
        return false;
      }
      if (isRegionRestricted) {
        notify("prediction.message.regionRestricted", "danger");
        return false;
      }
      if (!order) {
        notify("prediction.message.orderNotFound", "danger");
        return false;
      }
      if (
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < (config.quote_min ?? config.quote_tick ?? 0.01) ||
        price > (config.quote_max ?? 0.99) ||
        quantity < (config.base_min ?? config.base_tick ?? 0.01)
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      if (
        !new Decimal(price).div(config.quote_tick ?? 0.01).isInteger() ||
        !new Decimal(quantity).div(config.base_tick ?? 0.01).isInteger() ||
        new Decimal(price).mul(quantity).lt(config.min_notional ?? 5)
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      const remaining = new Decimal(quantity).sub(order.filledQuantity);
      // PERP-style quantity envelope only; backend checks repricing funds.
      const maxTotal = order.reduceOnly
        ? new Decimal(order.filledQuantity).add(
            availableQuantity(
              order.side === "sell" ? "up" : "down",
              id,
              order.symbol,
            ),
          )
        : new Decimal(order.quantity).add(
            maxOpeningQuantity(
              order.outcome,
              order.outcome === "up"
                ? order.price
                : toDisplayPrice(order.price),
              order.symbol,
            ),
          );
      if (
        remaining.lt(0) ||
        new Decimal(quantity).gt(maxTotal) ||
        quantity > (config.base_max ?? 10000)
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      try {
        const payload = binaryOrderEditPayload(
          order,
          price,
          quantity,
          config.quote_tick ?? 0.01,
          config.base_tick ?? 0.01,
        );
        if (!payload) {
          notify("prediction.message.orderNotFound", "danger");
          return false;
        }
        const response = await doUpdateOrder(payload);
        if (response?.success === false) {
          // Empty message falls through to the generic key in rejectionNotice.
          throw new Error(response?.message);
        }
        notify("prediction.message.orderUpdated");
        return true;
      } catch (error) {
        console.error("prediction order update rejected", error);
        notify(rejectionNotice(error), "danger");
        return false;
      }
    },
    [
      configBySymbol,
      doUpdateOrder,
      isRegionRestricted,
      availableQuantity,
      maxOpeningQuantity,
      notify,
      openOrders,
      selectedConfig,
      selectedSymbol,
    ],
  );
  return {
    submitOrder,
    placeOrder,
    sellPosition,
    editPendingOrder,
    isSubmitting,
  };
};

export type OrderSubmission = ReturnType<typeof useOrderSubmission>;
