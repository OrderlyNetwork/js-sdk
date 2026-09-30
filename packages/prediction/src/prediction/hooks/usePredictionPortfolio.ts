import { useCallback, useEffect, useMemo } from "react";
import {
  useCollateral,
  useMutation,
  useOrderStream,
  usePositionStream,
  usePrivateQuery,
} from "@orderly.network/hooks";
import {
  OrderSide,
  OrderStatus,
  OrderType,
  type API,
} from "@orderly.network/types";
import { Decimal, getTimestamp } from "@orderly.network/utils";
import {
  binaryRoundFromSymbol,
  isBinaryRowTradable,
  isBinarySymbol,
} from "../binary/binaryInfo";
import type { BinaryInfoRow } from "../binary/binaryInfo";
import { useBinaryFeeRates } from "../binary/useBinaryFeeRates";
import {
  type PredictionOpenOrder,
  type PredictionOutcome,
  type PredictionOrderSide,
  type PredictionOrderType,
  type PredictionPosition,
  type PredictionSettlement,
  type PredictionTrade,
} from "../prediction.types";
import { floorToTickDecimal } from "../predictionShared";

/** ISO buffer applied on top of the order notional when freezing collateral. */
export const ISO_ORDER_FROZEN_BUFFER = 0.0006;

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

export type UsePredictionPortfolioArgs = {
  active?: boolean;
  binaryRows: BinaryInfoRow[];
  notify: (message: string, tone?: "success" | "danger") => void;
  isRegionRestricted: boolean;
  isRoundTradable: boolean;
  selectedRound: number | undefined;
  /** Symbol of the selected round. */
  selectedSymbol: string | undefined;
  /** UP-coordinate BBO of the selected round's book. */
  bbo: {
    bestAsk: number | undefined;
    bestBid: number | undefined;
  };
  /**
   * User slippage setting (percent as a string), owned by the script root —
   * the value drives the MARKET protection price below.
   */
  slippage: string;
  onActiveTab: (
    tab: "openOrders" | "predictions" | "orderHistory" | "predictionHistory",
  ) => void;
};

const TERMINAL_ORDER_STATUSES = new Set([
  OrderStatus.FILLED,
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
]);

// decimal.js-light has no floor(); the shared core keeps sizing and
// submission exactly aligned (see predictionShared.floorToTickDecimal).
const toTickQuantity = (quantity: number, tick: number) =>
  floorToTickDecimal(quantity, tick).toString();

const toDisplayPrice = (upPrice: number) =>
  new Decimal(1).sub(upPrice).toNumber();

/**
 * UP-book request coordinates from the user's outcome view (api-spec §5.2):
 * buying DOWN @n is SELL UP @(1-n); selling a DOWN position (closing a short)
 * is BUY UP @(1-n).
 */
const toUpBookRequest = (
  outcome: PredictionOutcome,
  side: PredictionOrderSide,
  displayPrice: number,
) => {
  const upSide =
    side === "buy"
      ? outcome === "up"
        ? OrderSide.BUY
        : OrderSide.SELL
      : outcome === "up"
        ? OrderSide.SELL
        : OrderSide.BUY;
  const upPrice =
    outcome === "up" ? displayPrice : toDisplayPrice(displayPrice);
  return { upSide, upPrice };
};

const toProtectionPrice = (
  price: number,
  roundAway: boolean,
  config?: BinaryInfoRow,
  outcome: PredictionOutcome = "up",
) => {
  const tick = config?.quote_tick ?? 0.01;
  const upMin = config?.quote_min ?? tick;
  const upMax = config?.quote_max ?? 1 - tick;
  const min = outcome === "up" ? upMin : new Decimal(1).sub(upMax).toNumber();
  const max = outcome === "up" ? upMax : new Decimal(1).sub(upMin).toNumber();
  const stepped = new Decimal(price)
    .div(tick)
    .toDecimalPlaces(0, roundAway ? Decimal.ROUND_CEIL : Decimal.ROUND_FLOOR)
    .mul(tick);
  // decimal.js-light exposes no clamp; compare on the tick grid.
  if (stepped.lt(min)) return min;
  if (stepped.gt(max)) return max;
  return stepped.toNumber();
};

export const toPredictionOrder = (order: API.Order): PredictionOpenOrder => ({
  id: order.order_id,
  outcome: order.side === OrderSide.BUY ? "up" : "down",
  side: order.side === OrderSide.BUY ? "buy" : "sell",
  type: order.type === OrderType.LIMIT ? "limit" : "market",
  price: Number(order.price ?? 0),
  quantity: Number(order.quantity ?? 0),
  filledQuantity: Number(order.total_executed_quantity ?? 0),
  averagePrice:
    order.average_executed_price > 0 ? order.average_executed_price : undefined,
  reduceOnly: order.reduce_only,
  symbol: order.symbol,
  round: binaryRoundFromSymbol(order.symbol, order.created_time) ?? 0,
  timestamp: order.created_time,
});

const toPredictionSettlement = (
  row: API.PositionHistory,
): PredictionSettlement => {
  const isUp = row.side === "LONG";
  const expiryOutcome =
    row.outcome === "UP" ? "up" : row.outcome === "DOWN" ? "down" : undefined;
  // Display prices live in the position's own coordinate: a DOWN row shows
  // 1-p for both entry and exit so a winning DOWN settles at 1.
  const displayEntry = isUp
    ? row.avg_open_price
    : toDisplayPrice(row.avg_open_price);
  const settlementPrice = expiryOutcome
    ? isUp
      ? Number(row.settlement_price_per_share ?? 0)
      : toDisplayPrice(Number(row.settlement_price_per_share ?? 0))
    : isUp
      ? row.avg_close_price
      : toDisplayPrice(row.avg_close_price);
  const quantity = Math.abs(row.closed_position_qty);
  // api-spec §6.3: an expiry row only counts as settled once settled_at is
  // non-null AND a valid outcome/R is present. Until then the row must not
  // present final PnL or a settlement time (result_committed_at ≠ settled_at:
  // the round outcome is public, personal funds may still be in flight).
  const settling =
    expiryOutcome != null &&
    (row.settled_at == null || row.settlement_price_per_share == null);
  return {
    id: row.position_id,
    symbol: row.symbol,
    round: binaryRoundFromSymbol(row.symbol, row.open_timestamp) ?? 0,
    outcome: isUp ? "up" : "down",
    quantity,
    averagePrice: displayEntry,
    settlementPrice,
    result: expiryOutcome ?? "closed",
    payout: new Decimal(quantity).mul(settlementPrice).toNumber(),
    pnl: settling
      ? undefined
      : new Decimal(row.realized_pnl ?? 0).sub(row.trading_fee ?? 0).toNumber(),
    settledAt: settling
      ? undefined
      : expiryOutcome != null
        ? (row.settled_at ?? undefined)
        : row.close_timestamp,
    settling,
  };
};

export const usePredictionPortfolio = ({
  active = true,
  binaryRows,
  notify,
  isRegionRestricted,
  isRoundTradable,
  selectedSymbol,
  bbo,
  slippage,
  onActiveTab,
}: UsePredictionPortfolioArgs) => {
  const configBySymbol = useMemo(
    () => new Map(binaryRows.map((row) => [row.symbol, row])),
    [binaryRows],
  );
  const selectedConfig = selectedSymbol
    ? configBySymbol.get(selectedSymbol)
    : undefined;
  const feeRates = useBinaryFeeRates();

  const { freeCollateral } = useCollateral({ dp: 6 });
  // Available collateral in USDC, including account-level funding constraints.
  const balance = Number.isFinite(freeCollateral)
    ? Math.max(0, freeCollateral)
    : 0;

  // Binary orders only (api-spec §5.1.1). executionreport WS deltas keep both
  // streams fresh; the key prefix contract is unchanged.
  const [pendingOrdersData, pendingOrdersStream] = useOrderStream(
    { status: OrderStatus.INCOMPLETE, size: 100, productType: "BINARY" },
    { keeplive: true },
  );
  const pendingTotal = pendingOrdersStream.meta?.total;
  const pendingOrdersComplete =
    pendingTotal !== undefined &&
    (pendingOrdersData?.length ?? 0) >= pendingTotal;
  useEffect(() => {
    if (
      active &&
      pendingTotal !== undefined &&
      (pendingOrdersData?.length ?? 0) < pendingTotal &&
      !pendingOrdersStream.isValidating
    ) {
      pendingOrdersStream.loadMore();
    }
  }, [
    active,
    pendingTotal,
    pendingOrdersData?.length,
    pendingOrdersStream.isValidating,
    pendingOrdersStream.loadMore,
  ]);
  const [allOrdersData] = useOrderStream(
    { size: 100, productType: "BINARY" },
    { keeplive: true },
  );

  const openOrders = useMemo(
    () =>
      (pendingOrdersData ?? [])
        .filter((order) => !order.algo_order_id && isBinarySymbol(order.symbol))
        .map(toPredictionOrder),
    [pendingOrdersData],
  );

  const history = useMemo<PredictionTrade[]>(
    () =>
      (allOrdersData ?? [])
        .filter(
          (order) =>
            !order.algo_order_id &&
            isBinarySymbol(order.symbol) &&
            TERMINAL_ORDER_STATUSES.has(order.status),
        )
        .map((order) => ({
          ...toPredictionOrder(order),
          status:
            order.status === OrderStatus.FILLED
              ? ("filled" as const)
              : ("cancelled" as const),
        })),
    [allOrdersData],
  );

  const [positionData] = usePositionStream();

  /**
   * Every open binary position across rounds (TASK-38: the frontend keeps the
   * symbol↔product map — the positions response carries no product_type).
   */
  const positions = useMemo<PredictionPosition[]>(
    () =>
      (positionData?.rows ?? [])
        .filter(
          (row) =>
            isBinarySymbol(row.symbol) &&
            typeof row.position_qty === "number" &&
            row.position_qty !== 0,
        )
        .map((row) => ({
          outcome: row.position_qty > 0 ? ("up" as const) : ("down" as const),
          quantity: Math.abs(row.position_qty),
          averagePrice:
            row.position_qty > 0
              ? row.average_open_price
              : toDisplayPrice(row.average_open_price),
          symbol: row.symbol,
          round: binaryRoundFromSymbol(row.symbol) ?? undefined,
        })),
    [positionData],
  );

  const availableQuantity = useCallback(
    (outcome: PredictionOutcome, excludeId?: number, symbol?: string) => {
      const targetSymbol = symbol ?? selectedSymbol;
      const row = (positionData?.rows ?? []).find(
        (item) => item.symbol === targetSymbol,
      );
      if (!row) return 0;
      const isUp = row.position_qty > 0;
      if ((outcome === "up") !== isUp) return 0;

      // Closing an UP position rests on SELL orders; closing a DOWN short
      // rests on BUY orders. Netting means ANY resting closing-side order
      // consumes the position when filled — not only reduce_only ones — so
      // all of them reserve availability.
      const closingSide = isUp ? "sell" : "buy";
      const reserved = openOrders
        .filter(
          (order) =>
            order.symbol === targetSymbol &&
            order.side === closingSide &&
            order.id !== excludeId,
        )
        .reduce((sum, order) => sum.add(order.quantity), new Decimal(0));

      return Math.max(
        0,
        new Decimal(Math.abs(row.position_qty)).sub(reserved).toNumber(),
      );
    },
    [openOrders, positionData, selectedSymbol],
  );

  const { data: settlementRows } = usePrivateQuery<{
    rows: API.PositionHistory[];
  }>("/v1/position_history?product_type=BINARY&limit=1000", {
    formatter: (data) => data,
    revalidateOnFocus: false,
  });

  const settlements = useMemo(
    () => (settlementRows?.rows ?? []).map(toPredictionSettlement),
    [settlementRows],
  );

  const [doCreateOrder] = useMutation("/v1/order", "POST");
  const [doUpdateOrder] = useMutation("/v1/order", "PUT");
  const [doCancelOrder] = useMutation("/v1/order", "DELETE");
  const [doCancelAllOrders] = useMutation("/v1/orders", "DELETE");

  /** Protection price for a MARKET (→ IOC) order in the outcome coordinate. */
  const protectionPrice = useCallback(
    (outcome: PredictionOutcome, side: PredictionOrderSide) => {
      const slip = new Decimal(slippage || 0).div(100);
      if (outcome === "up") {
        if (side === "buy") {
          if (bbo.bestAsk == null) return undefined;
          return toProtectionPrice(
            new Decimal(bbo.bestAsk).mul(slip.add(1)).toNumber(),
            true,
            selectedConfig,
            outcome,
          );
        }
        if (bbo.bestBid == null) return undefined;
        return toProtectionPrice(
          new Decimal(bbo.bestBid).mul(new Decimal(1).sub(slip)).toNumber(),
          false,
          selectedConfig,
          outcome,
        );
      }
      // DOWN view mirrors the UP BBO: ask = 1 - bestBid, bid = 1 - bestAsk.
      if (side === "buy") {
        if (bbo.bestBid == null) return undefined;
        return toProtectionPrice(
          new Decimal(1).sub(bbo.bestBid).mul(slip.add(1)).toNumber(),
          true,
          selectedConfig,
          outcome,
        );
      }
      if (bbo.bestAsk == null) return undefined;
      return toProtectionPrice(
        new Decimal(1)
          .sub(bbo.bestAsk)
          .mul(new Decimal(1).sub(slip))
          .toNumber(),
        false,
        selectedConfig,
        outcome,
      );
    },
    [bbo.bestAsk, bbo.bestBid, selectedConfig, slippage],
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
    }): Promise<boolean> => {
      const {
        symbol,
        outcome,
        side,
        type,
        displayPrice,
        quantity,
        reduceOnly,
      } = input;
      if (!symbol) {
        notify("prediction.message.orderFailed", "danger");
        return false;
      }
      const config = configBySymbol.get(symbol);
      if (!config) {
        notify("prediction.message.orderFailed", "danger");
        return false;
      }
      if (
        !Number.isFinite(displayPrice) ||
        displayPrice <= 0 ||
        displayPrice >= 1
      ) {
        notify("prediction.invalidOrder", "danger");
        return false;
      }
      const { upSide, upPrice } = toUpBookRequest(outcome, side, displayPrice);
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

      try {
        const response = await doCreateOrder({
          symbol,
          side: upSide,
          // MARKET is expressed as an IOC carrying an explicit protection
          // price (api-spec §5.2).
          order_type: type === "limit" ? OrderType.LIMIT : OrderType.IOC,
          order_price: upPrice.toFixed(
            new Decimal(config.quote_tick ?? 0.01).decimalPlaces(),
          ),
          order_quantity: toTickQuantity(quantity, config.base_tick ?? 0.01),
          margin_mode: "ISOLATED",
          ...(reduceOnly ? { reduce_only: true } : {}),
        });
        if (response?.success === false) {
          throw new Error(response?.message ?? "order rejected");
        }
        return true;
      } catch (error) {
        console.error("prediction order rejected", error);
        notify("prediction.message.orderFailed", "danger");
        return false;
      }
    },
    [configBySymbol, doCreateOrder, notify],
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
      // Selling uses the selected round's book/protection prices; exits on
      // other rounds must switch the chart to that round first.
      if (targetSymbol !== selectedSymbol) {
        notify("prediction.message.sellFailed", "danger");
        return false;
      }
      const price =
        type === "market" ? protectionPrice(outcome, "sell") : limit;
      if (
        !isRoundTradable ||
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
      });
      if (!placed) return false;

      return true;
    },
    [
      availableQuantity,
      isRegionRestricted,
      isRoundTradable,
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
      if (
        !config ||
        !isBinaryRowTradable(config, getTimestamp()) ||
        isRegionRestricted ||
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price < (config.quote_min ?? config.quote_tick ?? 0.01) ||
        price > (config.quote_max ?? 0.99) ||
        quantity < (config.base_min ?? config.base_tick ?? 0.01)
      )
        return false;

      if (!order) return false;

      try {
        const response = await doUpdateOrder({
          order_id: id,
          symbol: order.symbol ?? selectedSymbol,
          // The table edits UP-book prices directly (single coordinate).
          order_price: price.toFixed(
            new Decimal(config.quote_tick ?? 0.01).decimalPlaces(),
          ),
          order_quantity: toTickQuantity(quantity, config.base_tick ?? 0.01),
        });
        if (response?.success === false) {
          throw new Error(response?.message ?? "order update rejected");
        }
        notify("prediction.message.orderUpdated");
        return true;
      } catch (error) {
        console.error("prediction order update rejected", error);
        notify("prediction.message.orderFailed", "danger");
        return false;
      }
    },
    [
      configBySymbol,
      doUpdateOrder,
      isRegionRestricted,
      notify,
      openOrders,
      selectedConfig,
      selectedSymbol,
    ],
  );

  const cancelOrder = useCallback(
    async (id: number, orderSymbol?: string) => {
      if (isRegionRestricted) return;
      const order = openOrders.find((item) => item.id === id);
      const symbol = orderSymbol ?? order?.symbol;
      if (!symbol) return;

      try {
        const response = await doCancelOrder(null, {
          order_id: id,
          symbol,
        });
        if (response?.success === false) {
          throw new Error(response?.message ?? "cancel rejected");
        }
        notify("prediction.message.orderCanceled");
      } catch (error) {
        console.error("prediction cancel rejected", error);
        notify("prediction.message.orderFailed", "danger");
      }
    },
    [doCancelOrder, isRegionRestricted, notify, openOrders, selectedSymbol],
  );

  const cancelAllOrders = useCallback(async () => {
    if (isRegionRestricted || openOrders.length === 0) return;

    const symbols = Array.from(
      new Set(openOrders.map((order) => order.symbol).filter(Boolean)),
    ) as string[];
    const results = await Promise.allSettled(
      symbols.map((symbol) => doCancelAllOrders(null, { symbol })),
    );
    if (results.some((result) => result.status === "rejected")) {
      console.error("prediction cancel-all partially rejected");
      notify("prediction.message.orderFailed", "danger");
      return;
    }
    notify("prediction.message.ordersCanceled");
  }, [doCancelAllOrders, isRegionRestricted, notify, openOrders]);

  /**
   * Contracts a one-tap quote amount buys: PRD §6.2 sizes on the price the
   * IOC actually carries (the protection price), floored to the base tick so
   * the displayed payout matches the submitted quantity.
   */
  const oneTapPayout = useCallback(
    (outcome: PredictionOutcome, quoteAmount: number) => {
      const price = protectionPrice(outcome, "buy");
      return price != null && price > 0 && price < 1
        ? new Decimal(
            toTickQuantity(
              new Decimal(quoteAmount).div(price).toNumber(),
              selectedConfig?.base_tick ?? 0.01,
            ),
          ).toNumber()
        : 0;
    },
    [protectionPrice, selectedConfig],
  );

  /**
   * One-tap gate priced entirely on the submitted protection price: the
   * user's slippage setting is already encoded in that price (PRD §6.4), so
   * there is no separate mid-based slippage estimate here; book-depth gating
   * composes in the script layer via estimateOrderSlippage.
   */
  const canPlaceOneTapOrder = useCallback(
    (outcome: PredictionOutcome, quoteAmount: number) => {
      const price = protectionPrice(outcome, "buy");
      // No executable ask side → the IOC cannot fill; fail closed.
      if (price == null) return false;
      const quantity = oneTapPayout(outcome, quoteAmount);
      // min_notional on the UP-book protection price (api-spec §5.2): for
      // DOWN this is (1-n)*qty.
      const upNotional = new Decimal(quantity).mul(
        outcome === "up" ? price : 1 - price,
      );
      // Frozen at submit = price*qty*(1+b) ≤ quoteAmount*(1+b) (PRD §7.2).
      return (
        isRoundTradable &&
        !isRegionRestricted &&
        feeRates.takerRate != null &&
        Number.isFinite(quoteAmount) &&
        quoteAmount > 0 &&
        new Decimal(quoteAmount)
          .mul(new Decimal(1).add(ISO_ORDER_FROZEN_BUFFER))
          .lte(balance) &&
        quantity > 0 &&
        upNotional.gte(selectedConfig?.min_notional ?? 5)
      );
    },
    [
      balance,
      feeRates.takerRate,
      isRegionRestricted,
      isRoundTradable,
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
      if (rate == null || upPrice <= 0 || upPrice >= 1) return undefined;
      return new Decimal(quantity)
        .mul(rate)
        .mul(upPrice)
        .mul(new Decimal(1).sub(upPrice))
        .toNumber();
    },
    [feeRates.makerRate, feeRates.takerRate],
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
    balance,
    positions,
    openOrders,
    pendingOrdersComplete,
    history,
    settlements,
    availableQuantity,
    /**
     * Fail-closed gate: with no valid binary fee config the account must not
     * trade through this UI (missing config is never "free", api-spec §6.4).
     */
    hasFeeConfig: feeRates.takerBps != null && feeRates.makerBps != null,
    protectionPrice,
    sellPosition,
    editPendingOrder,
    placeOrder,
    oneTapPayout,
    canPlaceOneTapOrder,
    placeOneTapOrder,
    cancelOrder,
    cancelAllOrders,
    feeRates,
    estimateFee,
    estimateFrozen,
  };
};
