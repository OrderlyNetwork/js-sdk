import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import {
  planPredictionExecution,
  type PredictionOrderPolicy,
} from "./predictionExecution";

export type PredictionOutcome = "up" | "down";
export type PredictionOrderSide = "buy" | "sell";
export type PredictionOrderType = "market" | "limit";
export type PredictionAmountUnit = "quote" | "outcome";
export type PredictionRoundPhase =
  | "trading"
  | "closingSoon"
  | "closed"
  | "resolving"
  | "resolvedUp"
  | "resolvedDown"
  | "void";
export type PredictionDataTab =
  | "openOrders"
  | "predictions"
  | "assets"
  | "orderHistory"
  | "filled"
  | "predictionHistory";
export type PredictionPrototypeAuthState =
  | "real"
  | "disconnected"
  | "connected"
  | "accountReady"
  | "funded";
export type PredictionPrototypeRegionState =
  | "real"
  | "allowed"
  | "restricted"
  | "unavailable";

export type PredictionNotification = {
  id: number;
  message: string;
  tone: "success" | "danger";
};

const PREDICTION_PROTOTYPE_AUTH_STORAGE_KEY =
  "orderly-prediction-prototype-auth-state";
const PREDICTION_PROTOTYPE_REGION_STORAGE_KEY =
  "orderly-prediction-prototype-region-state";

export type PredictionPosition = {
  outcome: PredictionOutcome;
  quantity: number;
  averagePrice: number;
};

export type PredictionOpenOrder = {
  policy?: PredictionOrderPolicy;
  id: number;
  outcome: PredictionOutcome;
  side: PredictionOrderSide;
  type: PredictionOrderType;
  price: number;
  quantity: number;
  round: number;
  timestamp: number;
};

export type PredictionTrade = PredictionOpenOrder & {
  status: "filled" | "cancelled";
};

export type PredictionSettlement = {
  id: number;
  round: number;
  outcome: PredictionOutcome;
  quantity: number;
  averagePrice: number;
  settlementPrice: number;
  result?: PredictionOutcome | "closed";
  payout: number;
  pnl: number;
  settledAt: number;
};

export type PredictionMockPerpPosition = {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  averagePrice: number;
  markPrice: number;
  pnl: number;
  leverage: number;
  liquidationPrice: number;
  margin: number;
};

export type PredictionMockTransaction = {
  id: number;
  timestamp: number;
  type: "deposit" | "withdraw" | "settlement";
  asset: string;
  amount: number;
  status: "completed" | "pending";
};

export type PredictionChartPoint = {
  price: number;
  timestamp: number;
};

export type PredictionOrderBookLevel = {
  price: number;
  quantity: number;
};

const ROUND_SECONDS = 5 * 60;
const CHART_WINDOW_MS = 65 * 1_000;
const INITIAL_BALANCE = 1_000;
const INITIAL_BTC_PRICE = 64_280.4;
const INITIAL_ROUND = 1_787_541_000;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const createInitialHistory = (price: number): PredictionChartPoint[] => {
  const now = Date.now();
  return Array.from({ length: 48 }, (_, index) => ({
    price:
      price +
      Math.sin(index / 4) * 42 +
      Math.cos(index / 7) * 19 +
      (index - 24) * 0.8,
    timestamp: now - (47 - index) * 1_000,
  }));
};

const createBook = (midPrice: number) => {
  const asks: PredictionOrderBookLevel[] = [];
  const bids: PredictionOrderBookLevel[] = [];

  for (let index = 0; index < 7; index += 1) {
    const step = (index + 1) * 0.01;
    asks.push({
      price: clamp(midPrice + step, 0.0001, 0.9999),
      quantity: 180 + index * 73 + ((index * 37) % 90),
    });
    bids.push({
      price: clamp(midPrice - step, 0.0001, 0.9999),
      quantity: 210 + index * 61 + ((index * 29) % 110),
    });
  }

  return { asks: asks.reverse(), bids };
};

const estimateMarketSlippage = (
  side: PredictionOrderSide,
  quantity: number,
  orderBook: {
    asks: PredictionOrderBookLevel[];
    bids: PredictionOrderBookLevel[];
  },
) => {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const levels = (side === "buy" ? orderBook.asks : orderBook.bids)
    .filter((level) => level.quantity > 0)
    .sort((a, b) => (side === "buy" ? a.price - b.price : b.price - a.price));
  const bestPrice = levels[0]?.price;
  if (!bestPrice) return null;

  let remaining = new Decimal(quantity);
  let notional = new Decimal(0);
  for (const level of levels) {
    const fill = remaining.lte(level.quantity)
      ? remaining
      : new Decimal(level.quantity);
    notional = notional.add(fill.mul(level.price));
    remaining = remaining.sub(fill);
    if (remaining.lte(0)) break;
  }

  const filled = new Decimal(quantity).sub(remaining);
  if (filled.lte(0)) return null;

  return notional.div(filled).sub(bestPrice).abs().div(bestPrice).toNumber();
};

export const usePredictionScript = (regionRestricted = false) => {
  const [prototypeAuthState, setPrototypeAuthState] =
    useLocalStorage<PredictionPrototypeAuthState>(
      PREDICTION_PROTOTYPE_AUTH_STORAGE_KEY,
      "real",
    );
  const [prototypeRegionState, setPrototypeRegionState] =
    useLocalStorage<PredictionPrototypeRegionState>(
      PREDICTION_PROTOTYPE_REGION_STORAGE_KEY,
      "real",
    );
  const [round, setRound] = useState(INITIAL_ROUND);
  const isRegionRestricted =
    regionRestricted ||
    prototypeRegionState === "restricted" ||
    prototypeRegionState === "unavailable";
  const [selectedRound, setSelectedRound] = useState(INITIAL_ROUND);
  const roundView =
    selectedRound < round ? "past" : selectedRound > round ? "future" : "live";
  const [countdown, setCountdown] = useState(ROUND_SECONDS - 43);
  const [roundPhase, setRoundPhase] = useState<PredictionRoundPhase>("trading");
  const [openingPrice, setOpeningPrice] = useState(INITIAL_BTC_PRICE);
  const [currentPrice, setCurrentPrice] = useState(INITIAL_BTC_PRICE + 76.2);
  const [priceHistory, setPriceHistory] = useState<PredictionChartPoint[]>(() =>
    createInitialHistory(INITIAL_BTC_PRICE),
  );
  const [selectedOutcome, setSelectedOutcome] =
    useState<PredictionOutcome>("up");
  const [orderSide, setOrderSide] = useState<PredictionOrderSide>("buy");
  const [orderType, setOrderType] = useState<PredictionOrderType>("market");
  const orderPolicy: PredictionOrderPolicy = "gtc";
  const [amountUnit, setAmountUnit] = useState<PredictionAmountUnit>("quote");
  const [amount, setAmount] = useState("100");
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null,
  );
  const [limitPrice, setLimitPrice] = useState("0.5000");
  const [slippage, setSlippage] = useLocalStorage("orderly-slippage", "1");
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
      round: INITIAL_ROUND - ROUND_SECONDS,
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
      round: INITIAL_ROUND - ROUND_SECONDS,
      status: "cancelled",
      timestamp: Date.now() - 14 * 60 * 1_000,
    },
  ]);
  const [settlements, setSettlements] = useState<PredictionSettlement[]>(() => [
    {
      id: -5,
      round: INITIAL_ROUND - ROUND_SECONDS,
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
  const [activeTab, setActiveTab] = useState<PredictionDataTab>("predictions");
  const [notification, setNotification] = useState<PredictionNotification>();
  const notificationIdRef = useRef(0);
  const tickRef = useRef(0);
  const nextIdRef = useRef(1);

  // Keep prototype feedback behind one event-like boundary so real execution
  // reports can replace it without changing the order-entry UI.
  const notify = useCallback(
    (message: string, tone: PredictionNotification["tone"] = "success") => {
      notificationIdRef.current += 1;
      setNotification({ id: notificationIdRef.current, message, tone });
    },
    [],
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

  const triggerMockAssetAction = useCallback(
    (action: "convert" | "transfer") => {
      notify(
        `prediction.message.asset${action === "convert" ? "Convert" : "Transfer"}`,
      );
    },
    [notify],
  );

  const upChance = useMemo(() => {
    const relativeMove = (currentPrice - openingPrice) / openingPrice;
    const timePressure = 1 + (1 - countdown / ROUND_SECONDS) * 0.35;
    return clamp(50 + relativeMove * 4_000 * timePressure, 8, 92);
  }, [countdown, currentPrice, openingPrice]);

  const outcomePrices = useMemo(
    () => ({
      up: upChance / 100,
      down: 1 - upChance / 100,
    }),
    [upChance],
  );

  const selectedMarketPrice = outcomePrices[selectedOutcome];
  const selectedPrice =
    orderType === "limit" ? Number(limitPrice) || 0 : selectedMarketPrice;

  const selectedPosition = positions.find(
    (position) => position.outcome === selectedOutcome,
  );

  const numericAmount = Number(amount) || 0;
  const orderQuantity = useMemo(() => {
    if (amountUnit === "outcome") return numericAmount;
    if (selectedPrice <= 0) return 0;
    return new Decimal(numericAmount).div(selectedPrice).toNumber();
  }, [amountUnit, numericAmount, selectedPrice]);

  const orderNotional = useMemo(
    () => new Decimal(orderQuantity).mul(selectedPrice).toNumber(),
    [orderQuantity, selectedPrice],
  );

  const estimatedContracts = orderQuantity;

  const estimatedPayout = estimatedContracts;
  const estimatedProfit =
    orderSide === "buy"
      ? new Decimal(estimatedPayout).sub(orderNotional).toNumber()
      : 0;

  const odds =
    selectedPrice > 0 ? new Decimal(1).div(selectedPrice).toNumber() : 0;

  const availableQuantity = (outcome: PredictionOutcome, excludeId?: number) =>
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
    );
  const selectedTokenBalance = availableQuantity(selectedOutcome);
  const maxQuoteAmount =
    orderSide === "buy"
      ? balance
      : new Decimal(selectedTokenBalance).mul(selectedPrice).toNumber();
  const maxOutcomeAmount =
    orderSide === "buy"
      ? selectedPrice > 0
        ? new Decimal(balance).div(selectedPrice).toNumber()
        : 0
      : selectedTokenBalance;
  const maxAmount = amountUnit === "quote" ? maxQuoteAmount : maxOutcomeAmount;
  const orderPercentage =
    maxAmount > 0 ? clamp((numericAmount / maxAmount) * 100, 0, 100) : 0;

  const orderBook = useMemo(
    () => createBook(selectedMarketPrice),
    [selectedMarketPrice],
  );
  const estimatedSlippage = useMemo(
    () => estimateMarketSlippage(orderSide, orderQuantity, orderBook),
    [orderBook, orderQuantity, orderSide],
  );
  const isSlippageExceeded =
    orderType === "market" &&
    estimatedSlippage !== null &&
    estimatedSlippage > new Decimal(slippage || 0).div(100).toNumber();

  const isRoundTradable =
    selectedRound >= round &&
    (roundPhase === "trading" || roundPhase === "closingSoon");

  const canPlaceOrder = useMemo(() => {
    if (!isRoundTradable || isRegionRestricted) return false;
    if (isSlippageExceeded) return false;
    if (numericAmount <= 0 || selectedPrice <= 0 || selectedPrice >= 1) {
      return false;
    }
    if (orderSide === "buy") return orderNotional <= balance;
    return orderQuantity <= selectedTokenBalance;
  }, [
    balance,
    isRegionRestricted,
    isRoundTradable,
    isSlippageExceeded,
    numericAmount,
    orderNotional,
    orderQuantity,
    orderSide,
    selectedPrice,
    selectedTokenBalance,
  ]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const delta = Math.sin(tick / 12) * 0.35 + Math.cos(tick / 23) * 0.18;
      if (
        roundPhase === "trading" ||
        roundPhase === "closingSoon" ||
        roundPhase === "closed"
      ) {
        setCurrentPrice((previous) => {
          const next = previous + delta;
          const timestamp = Date.now();
          setPriceHistory((points) => [
            ...points.filter(
              (point) => point.timestamp >= timestamp - CHART_WINDOW_MS,
            ),
            { price: next, timestamp },
          ]);
          return next;
        });
      }
      if (roundPhase === "trading" || roundPhase === "closingSoon") {
        setCountdown((previous) => {
          const next = Math.max(previous - 1, 0);
          if (next === 0 && selectedRound > round) {
            setRound((previousRound) => previousRound + ROUND_SECONDS);
            return ROUND_SECONDS;
          }
          if (
            next === 30 &&
            roundPhase === "trading" &&
            selectedRound === round
          ) {
            setRoundPhase("closingSoon");
          }
          if (next === 0) setRoundPhase("closed");
          return next;
        });
      }
    }, 1_000);

    return () => window.clearInterval(timer);
  }, [roundPhase, selectedRound, round]);

  const selectRoundPhase = useCallback(
    (phase: PredictionRoundPhase) => {
      setRoundPhase(phase);
      setNotification(undefined);

      if (phase === "trading") setCountdown(180);
      if (phase === "closingSoon") setCountdown(20);
      if (phase === "closed" || phase === "resolving") setCountdown(0);

      if (phase === "resolvedUp" || phase === "resolvedDown") {
        const nextPrice =
          phase === "resolvedUp" ? openingPrice + 48 : openingPrice - 48;
        setCurrentPrice(nextPrice);
        setPriceHistory((points) => [
          ...points,
          { price: nextPrice, timestamp: Date.now() },
        ]);
      }
    },
    [openingPrice],
  );

  const goToLiveRound = useCallback(() => {
    setOpeningPrice(currentPrice);
    setRound((previous) => previous + ROUND_SECONDS);
    setSelectedRound(round + ROUND_SECONDS);
    setCountdown(ROUND_SECONDS);
    setRoundPhase("trading");
    setPriceHistory(createInitialHistory(currentPrice));
    setNotification(undefined);
  }, [currentPrice, round]);

  const selectMarketRound = (nextRound: number) => {
    setSelectedRound(nextRound);
    setRoundPhase(nextRound < round ? "resolvedUp" : "trading");
    setNotification(undefined);
    setCountdown(ROUND_SECONDS - 43);
  };
  const setRoundView = (view: "past" | "live" | "future") => {
    selectMarketRound(
      round +
        (view === "past"
          ? -ROUND_SECONDS
          : view === "future"
            ? ROUND_SECONDS
            : 0),
    );
  };

  const selectOutcome = useCallback(
    (outcome: PredictionOutcome) => {
      setSelectedOutcome(outcome);
      setLimitPrice(outcomePrices[outcome].toFixed(4));
    },
    [outcomePrices],
  );

  const selectOrderType = useCallback(
    (type: PredictionOrderType) => {
      setOrderType(type);
      if (type === "limit") {
        setAmountUnit("outcome");
        setLimitPrice(outcomePrices[selectedOutcome].toFixed(4));
      }
    },
    [outcomePrices, selectedOutcome],
  );

  const selectAmountUnit = useCallback(
    (unit: PredictionAmountUnit) => {
      if (unit === amountUnit) return;
      const value = Number(amount) || 0;
      const converted =
        unit === "outcome"
          ? selectedPrice > 0
            ? new Decimal(value).div(selectedPrice).toNumber()
            : 0
          : new Decimal(value).mul(selectedPrice).toNumber();
      setAmountUnit(unit);
      setAmount(value > 0 ? converted.toFixed(unit === "quote" ? 2 : 4) : "");
    },
    [amount, amountUnit, selectedPrice],
  );

  const settleRound = useCallback(() => {
    const winningOutcome: PredictionOutcome =
      currentPrice >= openingPrice ? "up" : "down";
    const payout = positions
      .filter((position) => position.outcome === winningOutcome)
      .reduce((total, position) => total + position.quantity, 0);
    const cost = positions.reduce(
      (total, position) => total + position.quantity * position.averagePrice,
      0,
    );
    const quantity = positions.reduce(
      (total, position) => total + position.quantity,
      0,
    );

    setBalance((previous) => previous + payout);
    setSettlements((previous) => [
      ...positions.map((position) => {
        const settlementPrice = position.outcome === winningOutcome ? 1 : 0;
        const payout = new Decimal(position.quantity)
          .mul(settlementPrice)
          .toNumber();
        return {
          id: nextIdRef.current++,
          round,
          outcome: position.outcome,
          quantity: position.quantity,
          averagePrice: position.averagePrice,
          settlementPrice,
          payout,
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
    setOpenOrders((orders) => {
      if (orders.length > 0) {
        setHistory((previous) => [
          ...orders.map((order) => ({
            ...order,
            status: "cancelled" as const,
            timestamp: Date.now(),
          })),
          ...previous,
        ]);
      }
      return [];
    });
    setOpeningPrice(currentPrice);
    setRound((previous) => previous + ROUND_SECONDS);
    setSelectedRound(round + ROUND_SECONDS);
    setCountdown(ROUND_SECONDS);
    setRoundPhase("trading");
    setActiveTab("predictionHistory");
    notify("prediction.message.settled");
  }, [currentPrice, notify, openingPrice, positions, round]);

  const sellPosition = (
    outcome: PredictionOutcome,
    quantity: number,
    type: PredictionOrderType,
    limit: number,
  ) => {
    const price = type === "market" ? outcomePrices[outcome] : limit;
    const position = positions.find((p) => p.outcome === outcome);
    if (
      !isRoundTradable ||
      isRegionRestricted ||
      !position ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      quantity > availableQuantity(outcome) ||
      !Number.isFinite(price) ||
      price <= 0 ||
      price >= 1
    )
      return false;
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
      setActiveTab("openOrders");
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
  };

  const editPendingOrder = (id: number, price: number, quantity: number) => {
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
  };

  const placeOrder = useCallback(() => {
    setNotification(undefined);
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
      setActiveTab("openOrders");
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
      setActiveTab("orderHistory");
      notify("prediction.message.orderCanceled");
      return;
    }

    if (orderSide === "buy") {
      setBalance((previous) =>
        new Decimal(previous).sub(new Decimal(quantity).mul(price)).toNumber(),
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
      setBalance((previous) => new Decimal(previous).add(proceeds).toNumber());
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
    setSelectedPercentage(null);
    setAmount("");
    setActiveTab("predictions");
    notify("prediction.message.orderFilled");
  }, [
    canPlaceOrder,
    orderBook,
    selectedPosition,
    notify,
    orderNotional,
    orderQuantity,
    orderSide,
    orderType,
    round,
    selectedRound,
    selectedOutcome,
    selectedPrice,
  ]);

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

    setOpenOrders((orders) => {
      if (orders.length > 0) {
        setHistory((historyItems) => [
          ...orders.map((order) => ({
            ...order,
            status: "cancelled" as const,
          })),
          ...historyItems,
        ]);
      }
      return [];
    });
    notify("prediction.message.ordersCanceled");
  }, [notify, openOrders.length, isRegionRestricted]);

  const setOrderPercentage = useCallback(
    (percentage: number) => {
      const nextPercentage = clamp(percentage, 0, 100);
      setSelectedPercentage(nextPercentage);
      const nextAmount = new Decimal(maxAmount)
        .mul(nextPercentage)
        .div(100)
        .toDecimalPlaces(amountUnit === "quote" ? 2 : 4, Decimal.ROUND_DOWN);
      setAmount(
        nextAmount.gt(0)
          ? nextAmount.toFixed(amountUnit === "quote" ? 2 : 4)
          : "",
      );
    },
    [amountUnit, maxAmount],
  );

  useEffect(() => {
    if (selectedPercentage !== null) {
      setOrderPercentage(selectedPercentage);
    }
  }, [selectedPercentage, setOrderPercentage]);

  const setManualAmount = useCallback((value: string) => {
    setSelectedPercentage(null);
    setAmount(value);
  }, []);

  const setMaxAmount = useCallback(() => {
    setOrderPercentage(100);
  }, [setOrderPercentage]);

  return {
    round,
    countdown,
    roundPhase,
    selectedRound,
    selectMarketRound,
    roundView,
    setRoundView,
    setRoundPhase: selectRoundPhase,
    goToLiveRound,
    isRoundTradable,
    openingPrice,
    currentPrice,
    priceHistory,
    upChance,
    outcomePrices,
    selectedOutcome,
    setSelectedOutcome: selectOutcome,
    orderSide,
    setOrderSide,
    orderType,
    setOrderType: selectOrderType,
    amountUnit,
    setAmountUnit: selectAmountUnit,
    amount,
    setAmount: setManualAmount,
    limitPrice,
    setLimitPrice,
    balance,
    positions,
    openOrders,
    history,
    settlements,
    mockPerpPositions,
    closeMockPerpPosition,
    reverseMockPerpPosition,
    triggerMockAssetAction,
    mockTransactions,
    prototypeAuthState,
    setPrototypeAuthState,
    prototypeRegionState,
    isRegionRestricted,
    setPrototypeRegionState,
    activeTab,
    setActiveTab,
    orderBook,
    slippage,
    setSlippage,
    estimatedSlippage,
    isSlippageExceeded,
    selectedPrice,
    selectedPosition,
    estimatedContracts,
    estimatedPayout,
    estimatedProfit,
    odds,
    orderQuantity,
    orderNotional,
    maxAmount,
    maxQuoteAmount,
    maxOutcomeAmount,
    orderPercentage: selectedPercentage ?? orderPercentage,
    canPlaceOrder,
    notification,
    placeOrder,
    availableQuantity,
    sellPosition,
    editPendingOrder,
    cancelOrder,
    cancelAllOrders,
    setMaxAmount,
    setOrderPercentage,
    settleRound,
  };
};

export type PredictionState = ReturnType<typeof usePredictionScript>;
