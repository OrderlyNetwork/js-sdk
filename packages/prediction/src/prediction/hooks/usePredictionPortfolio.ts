import { useCallback, useRef, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import {
  INITIAL_BALANCE,
  INITIAL_ROUND,
  type PredictionMockPerpPosition,
  type PredictionMockTransaction,
  type PredictionOpenOrder,
  type PredictionOrderBookLevel,
  type PredictionOrderSide,
  type PredictionOrderType,
  type PredictionOutcome,
  type PredictionPosition,
  type PredictionSettlement,
  type PredictionTrade,
} from "../prediction.types";
import {
  planPredictionExecution,
  type PredictionOrderPolicy,
} from "../predictionExecution";
import { ROUND_INTERVAL_SECONDS } from "../predictionShared";
import { createBook, estimateMarketSlippage } from "./usePredictionOrderBook";

export type PlaceOrderInput = {
  canPlaceOrder: boolean;
  orderSide: PredictionOrderSide;
  orderType: PredictionOrderType;
  orderPolicy: PredictionOrderPolicy;
  selectedOutcome: PredictionOutcome;
  selectedPrice: number;
  orderQuantity: number;
  orderBook: {
    asks: PredictionOrderBookLevel[];
    bids: PredictionOrderBookLevel[];
  };
  selectedPosition?: PredictionPosition;
  onResetAmountAfterFill: () => void;
  clearNotification: () => void;
};

export type UsePredictionPortfolioArgs = {
  notify: (message: string, tone?: "success" | "danger") => void;
  isRegionRestricted: boolean;
  isRoundTradable: boolean;
  selectedRound: number;
  round: number;
  currentPrice: number;
  openingPrice: number;
  outcomePrices: Record<PredictionOutcome, number>;
  onActiveTab: (
    tab: "openOrders" | "predictions" | "orderHistory" | "predictionHistory",
  ) => void;
  onAdvanceAfterSettle: (currentPrice: number) => void;
};

export const usePredictionPortfolio = ({
  notify,
  isRegionRestricted,
  isRoundTradable,
  selectedRound,
  round,
  currentPrice,
  openingPrice,
  outcomePrices,
  onActiveTab,
  onAdvanceAfterSettle,
}: UsePredictionPortfolioArgs) => {
  const [slippage, setSlippage] = useLocalStorage(
    "orderly-prediction-slippage",
    "1",
  );
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [positions, setPositions] = useState<PredictionPosition[]>([
    { outcome: "up", quantity: 24, averagePrice: 0.4625 },
    { outcome: "down", quantity: 8, averagePrice: 0.4175 },
  ]);
  const [openOrders, setOpenOrders] = useState<PredictionOpenOrder[]>([
    {
      id: -1,
      outcome: "up",
      side: "buy",
      type: "limit",
      price: 0.48,
      quantity: 12,
      round: INITIAL_ROUND,
      timestamp: Date.now() - 2 * 60 * 1_000,
    },
    {
      id: -2,
      outcome: "down",
      side: "sell",
      type: "limit",
      price: 0.44,
      quantity: 5,
      round: INITIAL_ROUND,
      timestamp: Date.now() - 4 * 60 * 1_000,
    },
  ]);
  const [history, setHistory] = useState<PredictionTrade[]>(() => [
    {
      id: -3,
      outcome: "up",
      side: "buy",
      type: "market",
      price: 0.455,
      quantity: 20,
      round: INITIAL_ROUND - ROUND_INTERVAL_SECONDS,
      status: "filled",
      timestamp: Date.now() - 8 * 60 * 1_000,
    },
    {
      id: -4,
      outcome: "down",
      side: "buy",
      type: "limit",
      price: 0.42,
      quantity: 10,
      round: INITIAL_ROUND - ROUND_INTERVAL_SECONDS,
      status: "cancelled",
      timestamp: Date.now() - 14 * 60 * 1_000,
    },
  ]);
  const [settlements, setSettlements] = useState<PredictionSettlement[]>(() => [
    {
      id: -5,
      round: INITIAL_ROUND - ROUND_INTERVAL_SECONDS,
      outcome: "up",
      quantity: 18,
      averagePrice: 0.46,
      settlementPrice: 1,
      payout: 18,
      pnl: 9.72,
      result: "up",
      settledAt: Date.now() - 22 * 60 * 1_000,
    },
  ]);
  const [mockPerpPositions, setMockPerpPositions] = useState<
    PredictionMockPerpPosition[]
  >([
    {
      symbol: "PERP_ETH_USDC",
      side: "long",
      quantity: 0.35,
      averagePrice: 2_462.8,
      markPrice: 2_504.11,
      pnl: 14.46,
      leverage: 10,
      liquidationPrice: 2_216.52,
      margin: 86.2,
    },
    {
      symbol: "PERP_BTC_USDC",
      side: "short",
      quantity: 0.012,
      averagePrice: 64_520.4,
      markPrice: 64_358.02,
      pnl: 1.95,
      leverage: 20,
      liquidationPrice: 67_746.42,
      margin: 38.71,
    },
  ]);
  const mockTransactions: PredictionMockTransaction[] = [
    {
      id: -6,
      timestamp: Date.now() - 35 * 60 * 1_000,
      type: "deposit",
      asset: "USDC",
      amount: 500,
      status: "completed",
    },
    {
      id: -7,
      timestamp: Date.now() - 22 * 60 * 1_000,
      type: "settlement",
      asset: "USDC",
      amount: 28.25,
      status: "completed",
    },
  ];
  const nextIdRef = useRef(1);

  const availableQuantity = useCallback(
    (outcome: PredictionOutcome, excludeId?: number) =>
      Math.max(
        0,
        new Decimal(positions.find((p) => p.outcome === outcome)?.quantity ?? 0)
          .sub(
            openOrders
              .filter(
                (o) =>
                  o.side === "sell" &&
                  o.outcome === outcome &&
                  o.id !== excludeId,
              )
              .reduce((sum, o) => sum.add(o.quantity), new Decimal(0)),
          )
          .toNumber(),
      ),
    [openOrders, positions],
  );

  const closeMockPerpPosition = useCallback(
    (symbol: string) => {
      setMockPerpPositions((previous) =>
        previous.filter((position) => position.symbol !== symbol),
      );
      notify("prediction.message.positionClosed");
    },
    [notify],
  );

  const reverseMockPerpPosition = useCallback(
    (symbol: string) => {
      setMockPerpPositions((previous) =>
        previous.map((position) =>
          position.symbol === symbol
            ? {
                ...position,
                side: position.side === "long" ? "short" : "long",
                pnl: -position.pnl,
              }
            : position,
        ),
      );
      notify("prediction.message.positionReversed");
    },
    [notify],
  );

  const settleRound = useCallback(() => {
    const winningOutcome: PredictionOutcome =
      currentPrice >= openingPrice ? "up" : "down";
    const payout = positions
      .filter((position) => position.outcome === winningOutcome)
      .reduce((total, position) => total.add(position.quantity), new Decimal(0))
      .toNumber();

    setBalance((previous) => new Decimal(previous).add(payout).toNumber());
    setSettlements((previous) => [
      ...positions.map((position) => {
        const settlementPrice = position.outcome === winningOutcome ? 1 : 0;
        const positionPayout = new Decimal(position.quantity)
          .mul(settlementPrice)
          .toNumber();
        return {
          id: nextIdRef.current++,
          round,
          outcome: position.outcome,
          quantity: position.quantity,
          averagePrice: position.averagePrice,
          settlementPrice,
          payout: positionPayout,
          pnl: new Decimal(settlementPrice)
            .sub(position.averagePrice)
            .mul(position.quantity)
            .toNumber(),
          settledAt: Date.now(),
          result: winningOutcome,
        };
      }),
      ...previous,
    ]);
    setPositions([]);
    // History writes stay outside the setOpenOrders updater: updater functions
    // must be pure, or StrictMode double-invocation duplicates the entries.
    if (openOrders.length > 0) {
      setHistory((previous) => [
        ...openOrders.map((order) => ({
          ...order,
          status: "cancelled" as const,
          timestamp: Date.now(),
        })),
        ...previous,
      ]);
    }
    setOpenOrders([]);
    onAdvanceAfterSettle(currentPrice);
    onActiveTab("predictionHistory");
    notify("prediction.message.settled");
  }, [
    currentPrice,
    notify,
    onActiveTab,
    onAdvanceAfterSettle,
    openingPrice,
    openOrders,
    positions,
    round,
  ]);

  const sellPosition = useCallback(
    (
      outcome: PredictionOutcome,
      quantity: number,
      type: PredictionOrderType,
      limit: number,
    ) => {
      const price = type === "market" ? outcomePrices[outcome] : limit;
      const estimatedSellSlippage =
        type === "market"
          ? estimateMarketSlippage(
              "sell",
              quantity,
              createBook(outcomePrices[outcome]),
            )
          : null;
      const maxSlippage = new Decimal(slippage || 0).div(100).toNumber();
      const position = positions.find((p) => p.outcome === outcome);
      const slippageExceeded =
        estimatedSellSlippage !== null && estimatedSellSlippage > maxSlippage;
      if (
        !isRoundTradable ||
        isRegionRestricted ||
        !position ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > availableQuantity(outcome) ||
        !Number.isFinite(price) ||
        price <= 0 ||
        price >= 1 ||
        slippageExceeded
      ) {
        notify(
          slippageExceeded
            ? "prediction.message.slippageExceeded"
            : !position ||
                quantity <= 0 ||
                quantity > availableQuantity(outcome)
              ? "prediction.message.insufficientContracts"
              : "prediction.message.sellFailed",
          "danger",
        );
        return false;
      }
      const order: PredictionOpenOrder = {
        id: nextIdRef.current++,
        outcome,
        side: "sell",
        type,
        price,
        quantity,
        round: selectedRound,
        timestamp: Date.now(),
      };
      if (type === "limit") {
        setOpenOrders((previous) => [order, ...previous]);
        onActiveTab("openOrders");
        notify("prediction.message.orderPlaced");
      } else {
        const payout = new Decimal(quantity).mul(price).toNumber();
        setBalance((previous) => new Decimal(previous).add(payout).toNumber());
        setPositions((previous) =>
          previous
            .map((p) =>
              p.outcome === outcome
                ? {
                    ...p,
                    quantity: new Decimal(p.quantity).sub(quantity).toNumber(),
                  }
                : p,
            )
            .filter((p) => p.quantity > 0),
        );
        setHistory((previous) => [{ ...order, status: "filled" }, ...previous]);
        setSettlements((previous) => [
          {
            id: nextIdRef.current++,
            round: selectedRound,
            outcome,
            quantity,
            averagePrice: position.averagePrice,
            settlementPrice: price,
            payout,
            pnl: new Decimal(price)
              .sub(position.averagePrice)
              .mul(quantity)
              .toNumber(),
            settledAt: Date.now(),
            result: "closed",
          },
          ...previous,
        ]);
        notify("prediction.message.orderFilled");
      }
      return true;
    },
    [
      availableQuantity,
      isRegionRestricted,
      isRoundTradable,
      notify,
      onActiveTab,
      outcomePrices,
      positions,
      selectedRound,
      slippage,
    ],
  );

  const editPendingOrder = useCallback(
    (id: number, price: number, quantity: number) => {
      const order = openOrders.find((o) => o.id === id);
      if (
        !order ||
        !isRoundTradable ||
        isRegionRestricted ||
        !Number.isFinite(price) ||
        !Number.isFinite(quantity) ||
        price <= 0 ||
        price >= 1 ||
        quantity <= 0
      )
        return false;
      if (
        order.side === "sell" &&
        quantity > availableQuantity(order.outcome, id)
      )
        return false;
      if (order.side === "buy" && new Decimal(price).mul(quantity).gt(balance))
        return false;
      setOpenOrders((previous) =>
        previous.map((o) => (o.id === id ? { ...o, price, quantity } : o)),
      );
      notify("prediction.message.orderUpdated");
      return true;
    },
    [
      availableQuantity,
      balance,
      isRegionRestricted,
      isRoundTradable,
      notify,
      openOrders,
    ],
  );

  const placeOrder = useCallback(
    ({
      canPlaceOrder,
      orderSide,
      orderType,
      orderPolicy,
      selectedOutcome,
      selectedPrice,
      orderQuantity,
      orderBook,
      selectedPosition,
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

      const policy = orderType === "limit" ? orderPolicy : "gtc";
      const execution =
        orderType === "limit"
          ? planPredictionExecution(
              policy,
              orderSide,
              selectedPrice,
              orderQuantity,
              orderSide === "buy" ? orderBook.asks : orderBook.bids,
            )
          : {
              filled: orderQuantity,
              cancelled: 0,
              pending: 0,
              price: selectedPrice,
            };
      const price = execution.price;
      const quantity = execution.filled;
      const order: PredictionOpenOrder = {
        id: nextIdRef.current++,
        outcome: selectedOutcome,
        side: orderSide,
        type: orderType,
        price: selectedPrice,
        quantity: orderQuantity,
        policy,
        round: selectedRound,
        timestamp: Date.now(),
      };

      if (execution.pending > 0) {
        setOpenOrders((previous) => [order, ...previous]);
        onActiveTab("openOrders");
        notify("prediction.message.orderPlaced");
        return;
      }

      if (execution.cancelled > 0) {
        setHistory((previous) => [
          {
            ...order,
            id: nextIdRef.current++,
            quantity: execution.cancelled,
            status: "cancelled",
          },
          ...previous,
        ]);
      }
      if (quantity === 0) {
        onActiveTab("orderHistory");
        notify("prediction.message.orderCanceled");
        return;
      }

      if (orderSide === "buy") {
        setBalance((previous) =>
          new Decimal(previous)
            .sub(new Decimal(quantity).mul(price))
            .toNumber(),
        );
        setPositions((previous) => {
          const existing = previous.find(
            (position) => position.outcome === selectedOutcome,
          );
          if (!existing) {
            return [
              ...previous,
              { outcome: selectedOutcome, quantity, averagePrice: price },
            ];
          }
          const nextQuantity = new Decimal(existing.quantity)
            .add(quantity)
            .toNumber();
          const nextAverage = new Decimal(existing.quantity)
            .mul(existing.averagePrice)
            .add(new Decimal(quantity).mul(price))
            .div(nextQuantity)
            .toNumber();
          return previous.map((position) =>
            position.outcome === selectedOutcome
              ? {
                  ...position,
                  quantity: nextQuantity,
                  averagePrice: nextAverage,
                }
              : position,
          );
        });
      } else {
        const proceeds = new Decimal(quantity).mul(price).toNumber();
        setBalance((previous) =>
          new Decimal(previous).add(proceeds).toNumber(),
        );
        setPositions((previous) =>
          previous
            .map((position) =>
              position.outcome === selectedOutcome
                ? {
                    ...position,
                    quantity: new Decimal(position.quantity)
                      .sub(quantity)
                      .toNumber(),
                  }
                : position,
            )
            .filter((position) => position.quantity > 0),
        );
        const averagePrice = selectedPosition?.averagePrice ?? 0;
        setSettlements((previous) => [
          {
            id: nextIdRef.current++,
            round: selectedRound,
            outcome: selectedOutcome,
            quantity,
            averagePrice,
            settlementPrice: price,
            payout: proceeds,
            pnl: new Decimal(price).sub(averagePrice).mul(quantity).toNumber(),
            settledAt: Date.now(),
            result: "closed",
          },
          ...previous,
        ]);
      }

      setHistory((previous) => [
        { ...order, price, quantity, status: "filled", timestamp: Date.now() },
        ...previous,
      ]);
      onResetAmountAfterFill();
      onActiveTab("predictions");
      notify("prediction.message.orderFilled");
    },
    [notify, onActiveTab, selectedRound],
  );

  const cancelOrder = useCallback(
    (id: number) => {
      if (isRegionRestricted) return;
      const order = openOrders.find((item) => item.id === id);
      if (!order) return;

      setHistory((historyItems) => [
        { ...order, status: "cancelled" },
        ...historyItems,
      ]);
      setOpenOrders((previous) => previous.filter((item) => item.id !== id));
      notify("prediction.message.orderCanceled");
    },
    [notify, openOrders, isRegionRestricted],
  );

  const cancelAllOrders = useCallback(() => {
    if (isRegionRestricted) return;
    if (openOrders.length === 0) return;

    // Reads the closure `openOrders` instead of writing history inside the
    // setOpenOrders updater: updater functions must be pure, or StrictMode
    // double-invocation duplicates the entries.
    setHistory((previous) => [
      ...openOrders.map((order) => ({
        ...order,
        status: "cancelled" as const,
      })),
      ...previous,
    ]);
    setOpenOrders([]);
    notify("prediction.message.ordersCanceled");
  }, [notify, openOrders, isRegionRestricted]);

  return {
    balance,
    positions,
    openOrders,
    history,
    settlements,
    mockPerpPositions,
    mockTransactions,
    availableQuantity,
    slippage,
    setSlippage,
    closeMockPerpPosition,
    reverseMockPerpPosition,
    settleRound,
    sellPosition,
    editPendingOrder,
    placeOrder,
    cancelOrder,
    cancelAllOrders,
  };
};
