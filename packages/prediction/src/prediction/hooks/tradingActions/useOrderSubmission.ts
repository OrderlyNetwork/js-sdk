import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  useMutation,
  useSubAccountMutation,
  type useRefreshOrderCaches,
} from "@orderly.network/hooks";
import { i18n } from "@orderly.network/i18n";
import { OrderType } from "@orderly.network/types";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import { estimateBinaryOrderFrozen } from "../../binary/binaryCollateral";
import { isBinaryRowTradable } from "../../binary/binaryInfo";
import type { BinaryInfoRow } from "../../binary/binaryInfo";
import {
  binaryProtectionPrice,
  binarySubmissionNotice,
  estimateBinarySlippage,
  isBinaryMarketBatchAllowed,
  parseSlippageTicks,
  resolveBinaryOrderLimits,
  splitBinaryQuantity,
  submitBinaryBatches,
  toBinaryUpRequest,
  validateBinaryOrderSize,
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
  onSubmitted?: () => Promise<unknown>;
  active: boolean;
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
  configBySymbol: Map<string, BinaryInfoRow>;
  hasFeeConfig: boolean;
  refreshOrders: ReturnType<typeof useRefreshOrderCaches>;
  /** Shared unmount guard; false stops async continuations mid-flight. */
  bulkCancellationMounted: MutableRefObject<boolean>;
  availableQuantity: TradingEstimates["availableQuantity"];
  estimateAdditionalFrozen: TradingEstimates["estimateAdditionalFrozen"];
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
export const useOrderSubmission = ({
  resources,
  onSubmitted,
  active,
  notify,
  isRegionRestricted,
  selectedSymbol,
  bbo,
  slippage,
  book,
  configBySymbol,
  hasFeeConfig,
  refreshOrders,
  bulkCancellationMounted,
  availableQuantity,
  estimateAdditionalFrozen,
  protectionPrice,
  isOrderTradable,
}: OrderSubmissionArgs) => {
  const { accountState, accountReady } = resources;
  const { balance, getCollateralSnapshot, refreshAccountPositions } = resources;
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
  const canSendTargetOrder = useCallback(() => {
    const current = live.current;
    const config = current.selectedSymbol
      ? current.configBySymbol.get(current.selectedSymbol)
      : undefined;
    return (
      !!resources.canSubmit?.() &&
      bulkCancellationMounted.current &&
      current.accountReady &&
      current.hasFeeConfig &&
      !current.isRegionRestricted &&
      !!config &&
      isBinaryRowTradable(config, getTimestamp())
    );
  }, [resources.canSubmit, bulkCancellationMounted]);
  const [createTargetOrder] = useSubAccountMutation("/v1/order", "POST", {
    accountId: resources.targetAccountId,
    shouldExecute: canSendTargetOrder,
  });
  const [createTargetBatch] = useSubAccountMutation("/v1/batch-order", "POST", {
    accountId: resources.targetAccountId,
    shouldExecute: canSendTargetOrder,
  });
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
        (resources.canSubmit && !resources.canSubmit()) ||
        (resources.targetAccountId && !reduceOnly) ||
        submitting.current
      ) {
        notify(failureFallback ?? "prediction.message.orderFailed", "danger");
        return false;
      }
      const limits = resolveBinaryOrderLimits(config);
      const { upSide, upPrice } = toUpBookRequest(outcome, side, displayPrice);
      const quantities = splitBinaryQuantity(
        quantity,
        upPrice,
        config,
        reduceOnly,
      );
      const levels =
        outcome === "up"
          ? { asks: book.asks, bids: book.bids }
          : { asks: book.downAsks, bids: book.downBids };
      const estimated = estimateBinarySlippage(
        side,
        quantity,
        levels,
        limits.quoteTick,
      );
      const protection = binaryProtectionPrice(
        outcome,
        side,
        bbo,
        slippage,
        config,
      );
      // Size/config gates share one rejection key; market orders additionally
      // recheck the protection price and the executable depth here.
      const marketRejected =
        type === "market" &&
        (protection == null ||
          estimated == null ||
          parseSlippageTicks(slippage) == null ||
          estimated > parseSlippageTicks(slippage)! ||
          (side === "buy"
            ? new Decimal(displayPrice).gt(protection)
            : new Decimal(displayPrice).lt(protection)));
      if (
        !quantities ||
        marketRejected ||
        validateBinaryOrderSize({
          price: upPrice,
          quantity,
          limits,
          reduceOnly,
        })
      ) {
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
          new Decimal(limits.quoteTick).decimalPlaces(),
        ),
        order_quantity: toTickQuantity(size, limits.baseTick),
        margin_mode: "ISOLATED",
        ...(reduceOnly ? { reduce_only: true } : {}),
      }));
      let remainingQuantity = new Decimal(quantity);
      submitting.current = true;
      setIsSubmitting(true);
      try {
        if (resources.refreshForSubmission) {
          try {
            liveFunds.current = await resources.refreshForSubmission();
          } catch {
            notify(
              failureFallback ?? "prediction.message.sellFailed",
              "danger",
            );
            return false;
          }
        }
        const result = await submitBinaryBatches(
          orders,
          async (batch) => {
            const createOrder = resources.targetAccountId
              ? createTargetOrder
              : doCreateOrder;
            const createBatch = resources.targetAccountId
              ? createTargetBatch
              : doCreateBatchOrder;
            const response = await (batch.length === 1
              ? createOrder(batch[0])
              : createBatch({ orders: batch }));
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
              (resources.canSubmit && !resources.canSubmit()) ||
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
        if (
          bulkCancellationMounted.current &&
          live.current.accountId === accountState.accountId &&
          (resources.canSubmit
            ? resources.canSubmit()
            : live.current.accountReady)
        ) {
          await Promise.allSettled([
            refreshOrders(accountState.accountId),
            refreshAccountPositions(),
            ...(result.accepted > 0 || result.unknown > 0
              ? [onSubmitted?.()]
              : []),
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
      refreshAccountPositions,
      refreshOrders,
      onSubmitted,
      resources.targetAccountId,
      resources.refreshForSubmission,
      resources.canSubmit,
      createTargetOrder,
      createTargetBatch,
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
    },
    [notify, protectionPrice, selectedSymbol, submitOrder],
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
  return {
    submitOrder,
    placeOrder,
    sellPosition,
    isSubmitting,
  };
};

export type OrderSubmission = ReturnType<typeof useOrderSubmission>;
