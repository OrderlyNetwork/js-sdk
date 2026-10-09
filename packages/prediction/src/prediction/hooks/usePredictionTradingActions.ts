import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useMutation,
  useMemoizedFn,
  useRefreshOrderCaches,
} from "@orderly.network/hooks";
import { i18n } from "@orderly.network/i18n";
import { OrderType } from "@orderly.network/types";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import {
  estimateBinaryOrderFrozen,
  ISO_ORDER_FROZEN_BUFFER,
  maxBinaryOrderQuantity,
} from "../binary/binaryCollateral";
import { isBinaryRowTradable } from "../binary/binaryInfo";
import type { BinaryInfoRow } from "../binary/binaryInfo";
import { binaryOrderEditPayload } from "../binary/binaryOrderDisplay";
import {
  binaryProtectionPrice,
  binaryRejectionNotice,
  binarySubmissionNotice,
  estimateBinarySlippage,
  isBinaryMarketBatchAllowed,
  parseSlippageTicks,
  quoteToBinaryQuantity,
  splitBinaryQuantity,
  submitBinaryBatches,
  toBinaryUpRequest,
} from "../binary/binaryOrderRules";
import { useBinaryFeeRates } from "../binary/useBinaryFeeRates";
import type { BinaryOrderBook } from "../binary/useBinaryOrderbook";
import {
  cancelProductTargets,
  productCancellationTargets,
  type BinaryCancelAllOptions,
} from "../dataPanels/productOrderCancellation";
import {
  type PredictionOutcome,
  type PredictionOrderSide,
  type PredictionOrderType,
} from "../prediction.types";
import { floorToTickDecimal } from "../predictionShared";
import type { PredictionAccountResources } from "./usePredictionAccountResources";

export { toPredictionOrder } from "../binary/binaryOrderDisplay";
export { ISO_ORDER_FROZEN_BUFFER } from "../binary/binaryCollateral";
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
export type UsePredictionTradingActionsArgs = {
  resources: PredictionAccountResources;
  active?: boolean;
  binaryRows: BinaryInfoRow[];
  notify: (message: string, tone?: "success" | "danger") => void;
  isRegionRestricted: boolean;
  /** Symbol of the selected round. */
  selectedSymbol: string | undefined;
  /** UP-coordinate BBO of the selected round's book. */
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
    getCollateralSnapshot,
    pendingOrdersStream,
    allOrdersStream,
    refreshAccountPositions,
  } = resources;
  const availableQuantity = useCallback(
    (outcome: PredictionOutcome, excludeId?: number, symbol = selectedSymbol) =>
      resources.availableQuantity(outcome, excludeId, symbol),
    [resources.availableQuantity, selectedSymbol],
  );
  const fundingEstimateMode =
    getCollateralSnapshot(selectedSymbol)?.mode ?? "unavailable";
  const estimateAdditionalFrozen = useCallback(
    (
      outcome: PredictionOutcome,
      quantity: number,
      displayPrice: number,
      symbol = selectedSymbol,
    ) => {
      const { upSide, upPrice } = toUpBookRequest(outcome, "buy", displayPrice);
      const config = symbol ? configBySymbol.get(symbol) : undefined;
      const quantities = config
        ? splitBinaryQuantity(quantity, upPrice, config)
        : undefined;
      if (!quantities) return undefined;
      return estimateBinaryOrderFrozen(
        getCollateralSnapshot(symbol),
        upSide,
        upPrice,
        quantity,
        quantities,
      )?.toNumber();
    },
    [configBySymbol, getCollateralSnapshot, selectedSymbol],
  );
  const maxOpeningQuantity = useCallback(
    (
      outcome: PredictionOutcome,
      displayPrice: number,
      symbol = selectedSymbol,
    ) => {
      const config = symbol ? configBySymbol.get(symbol) : undefined;
      if (!config) return 0;
      const { upSide, upPrice } = toUpBookRequest(outcome, "buy", displayPrice);
      return maxBinaryOrderQuantity({
        snapshot: getCollateralSnapshot(symbol),
        side: upSide,
        upPrice,
        balance,
        baseTick: config.base_tick,
        baseMax: config.base_max,
        splitRules: config,
      });
    },
    [balance, configBySymbol, getCollateralSnapshot, selectedSymbol],
  );
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
  const [doCancelOrder] = useMutation("/v1/order", "DELETE");
  const [doCancelAllOrders] = useMutation("/v1/orders", "DELETE");
  /** Preview and submission share the live UP-book tick protection price. */
  const protectionPrice = useCallback(
    (
      outcome: PredictionOutcome,
      side: PredictionOrderSide,
      symbol = selectedSymbol,
    ) =>
      symbol === selectedSymbol
        ? binaryProtectionPrice(
            outcome,
            side,
            bbo,
            slippage,
            symbol ? configBySymbol.get(symbol) : undefined,
          )
        : undefined,
    [bbo, configBySymbol, selectedSymbol, slippage],
  );
  const isOrderTradable = useCallback(
    (symbol?: string) => {
      const config = symbol ? configBySymbol.get(symbol) : undefined;
      return (
        active && config != null && isBinaryRowTradable(config, getTimestamp())
      );
    },
    [active, configBySymbol],
  );
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
  const cancelOrder = useCallback(
    async (id: number, orderSymbol?: string) => {
      // Region gating is already reflected by the disabled cancel button;
      // the remaining paths only fire on click/render races, so say why.
      if (isRegionRestricted) return;
      const order = openOrders.find((item) => item.id === id);
      const symbol = orderSymbol ?? order?.symbol;
      if (!symbol) {
        notify("prediction.message.orderNotFound", "danger");
        return;
      }
      if (!isOrderTradable(symbol)) {
        notify("prediction.message.roundNotTradable", "danger");
        return;
      }
      try {
        const response = await doCancelOrder(null, {
          order_id: id,
          symbol,
        });
        if (response?.success === false) {
          // Empty message falls through to the generic key in rejectionNotice.
          throw new Error(response?.message);
        }
        notify("prediction.message.orderCanceled");
      } catch (error) {
        console.error("prediction cancel rejected", error);
        notify(rejectionNotice(error), "danger");
      }
    },
    [
      doCancelOrder,
      isOrderTradable,
      isRegionRestricted,
      notify,
      openOrders,
      selectedSymbol,
    ],
  );
  const bulkCancellationBusy = useRef(false);
  const bulkCancellationContext = useRef({
    accountId: accountState.accountId,
    revision: 0,
  });
  useLayoutEffect(() => {
    if (bulkCancellationContext.current.accountId !== accountState.accountId) {
      bulkCancellationContext.current = {
        accountId: accountState.accountId,
        revision: bulkCancellationContext.current.revision + 1,
      };
    }
  }, [accountState.accountId]);
  const bulkCancellationMounted = useRef(true);
  useEffect(() => {
    bulkCancellationMounted.current = true;
    return () => {
      bulkCancellationMounted.current = false;
    };
  }, []);
  const cancellationContext = useMemoizedFn(() => ({
    accountId: accountState.accountId,
    accountReady,
    openOrders,
    pendingOrdersComplete,
    isRegionRestricted,
    isOrderTradable,
  }));
  const cancelAllOrders = useMemoizedFn(
    async (options: BinaryCancelAllOptions = {}): Promise<boolean> => {
      const initial = cancellationContext();
      if (
        bulkCancellationBusy.current ||
        !bulkCancellationMounted.current ||
        !initial.accountReady ||
        !initial.accountId
      )
        return false;
      const revision = bulkCancellationContext.current.revision;
      const isCurrent = () =>
        bulkCancellationMounted.current &&
        bulkCancellationContext.current.revision === revision;
      const getTargets = () => {
        const current = cancellationContext();
        return isCurrent() &&
          current.accountReady &&
          current.accountId === initial.accountId
          ? productCancellationTargets({
              perps: [],
              perpsComplete: true,
              includePerps: false,
              binary: current.openOrders,
              binaryComplete: current.pendingOrdersComplete,
              includePrediction: true,
              predictionUnderlyingSymbol: options.underlyingSymbol,
              regionRestricted: current.isRegionRestricted,
              isBinaryTradable: current.isOrderTradable,
            })
          : undefined;
      };
      if (!getTargets()?.length) return false;
      bulkCancellationBusy.current = true;
      try {
        const success = await cancelProductTargets(
          getTargets,
          (symbol) => doCancelAllOrders(null, { symbol }),
          async () => undefined,
        );
        if (!success || !isCurrent()) return false;
        notify("prediction.message.ordersCanceled");
        return true;
      } catch (error) {
        if (isCurrent()) {
          console.error("prediction cancel-all partially rejected", error);
          notify(rejectionNotice(error), "danger");
        }
        return false;
      } finally {
        if (cancellationContext().accountId === initial.accountId) {
          await Promise.resolve()
            .then(() => refreshOrders(initial.accountId))
            .catch(() => undefined);
        }
        bulkCancellationBusy.current = false;
      }
    },
  );
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
  /**
   * Curve fee estimate C*r*p*(1-p) with the UP price p; undefined while the
   * account has no valid binary config (never free).
   */
  const estimateFee = useCallback(
    (quantity: number, upPrice: number, taker: boolean) => {
      const rate = taker ? feeRates.takerRate : feeRates.makerRate;
      if (
        !hasFeeConfig ||
        rate == null ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(upPrice) ||
        upPrice <= 0 ||
        upPrice >= 1
      )
        return undefined;
      return new Decimal(quantity)
        .mul(rate)
        .mul(upPrice)
        .mul(new Decimal(1).sub(upPrice))
        .toNumber();
    },
    [hasFeeConfig, feeRates.makerRate, feeRates.takerRate],
  );
  /**
   * Collateral frozen when opening a position: the price of the outcome being
   * bought × qty × (1 + ISO buffer). Buying DOWN @n is SELL UP @(1-n), which
   * freezes (1-n)×qty×(1+b) — i.e. the DISPLAY price in both cases (PRD §7.2
   * fixture: 100@0.1 BUY freezes 10.006, SELL 90.054).
   */
  const estimateFrozen = useCallback(
    (quantity: number, displayPrice: number) =>
      new Decimal(quantity)
        .mul(displayPrice)
        .mul(new Decimal(1).add(ISO_ORDER_FROZEN_BUFFER))
        .toNumber(),
    [],
  );
  return {
    ordersLoading: resources.ordersLoading,
    ordersError: resources.ordersError,
    positionsLoading: resources.positionsLoading,
    positionsError: resources.positionsError,
    balance,
    fundingEstimateMode,
    estimateAdditionalFrozen,
    maxOpeningQuantity,
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
    availableQuantity,
    /**
     * Fail-closed gate: with no valid binary fee config the account must not
     * trade through this UI (missing config is never "free", api-spec §6.4).
     */
    hasFeeConfig,
    accountReady,
    isSubmitting,
    isOrderTradable,
    protectionPrice,
    sellPosition,
    editPendingOrder,
    placeOrder,
    oneTapPayout,
    canPlaceOneTapOrder,
    oneTapBlockReason,
    placeOneTapOrder,
    cancelOrder,
    cancelAllOrders,
    feeRates,
    estimateFee,
    estimateFrozen,
  };
};
