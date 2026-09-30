import { useCallback, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { Decimal } from "@orderly.network/utils";
import { useBinaryRegionRestricted } from "./binary/useBinaryRegion";
import { useBinaryRounds } from "./binary/useBinaryRounds";
import { useBinaryUnderlying } from "./binary/useBinaryUnderlying";
import { usePredictionNotifications } from "./hooks/usePredictionNotifications";
import {
  usePredictionOrderBook,
  usePredictionOrderBookView,
} from "./hooks/usePredictionOrderBook";
import { usePredictionOrderForm } from "./hooks/usePredictionOrderForm";
import { usePredictionPortfolio } from "./hooks/usePredictionPortfolio";
import type { PredictionDataTab } from "./prediction.types";

export type {
  PredictionOutcome,
  PredictionOrderSide,
  PredictionOrderType,
  PredictionAmountUnit,
  PredictionRoundPhase,
  PredictionDataTab,
  PredictionNotification,
  PredictionPosition,
  PredictionOpenOrder,
  PredictionTrade,
  PredictionSettlement,
  PredictionChartPoint,
  PredictionOrderBookLevel,
} from "./prediction.types";

export const usePredictionScript = (
  regionRestricted = false,
  // While false the polling/subscriptions stay suspended; the shared provider
  // toggles it so unrelated routes do not keep the market streams alive.
  active = true,
  // Live market streams (orderbook/index WS) are only kept by the prediction
  // page itself; base consumers (perp/portfolio dropdowns, shared panels)
  // retain the cheap rounds polling but not the per-tick subscriptions.
  activeLive = true,
) => {
  const binaryRegionRestricted = useBinaryRegionRestricted();
  const isRegionRestricted = regionRestricted || binaryRegionRestricted;
  const [activeTab, setActiveTab] = useState<PredictionDataTab>("predictions");
  const [slippage, setSlippage] = useLocalStorage(
    "orderly-prediction-slippage",
    "1",
  );

  const { notification, notify, clearNotification } =
    usePredictionNotifications();

  const rounds = useBinaryRounds({ active });
  const selectedSymbol = rounds.selectedRow?.symbol;

  const underlying = useBinaryUnderlying({
    indexSymbol: rounds.underlyingSymbol,
    roundStartSec: rounds.selectedRound,
    expireAtMs: rounds.selectedRow?.expire_at,
    active: active && activeLive,
  });

  const orderbook = usePredictionOrderBook({
    symbol: selectedSymbol,
    active: active && activeLive,
  });

  const onActiveTab = useCallback((tab: PredictionDataTab) => {
    setActiveTab(tab);
  }, []);

  const portfolio = usePredictionPortfolio({
    active,
    binaryRows: rounds.rows,
    notify,
    isRegionRestricted,
    isRoundTradable: rounds.isRoundTradable,
    selectedRound: rounds.selectedRound,
    selectedSymbol,
    bbo: {
      bestAsk: orderbook.bbo.bestAsk,
      bestBid: orderbook.bbo.bestBid,
    },
    slippage,
    onActiveTab,
  });

  const form = usePredictionOrderForm({
    marketId: rounds.marketId,
    quoteTick: rounds.selectedRow?.quote_tick,
    quoteMin: rounds.selectedRow?.quote_min,
    quoteMax: rounds.selectedRow?.quote_max,
    baseTick: rounds.selectedRow?.base_tick,
    baseMin: rounds.selectedRow?.base_min,
    minNotional: rounds.selectedRow?.min_notional,
    outcomePrices: orderbook.outcomePrices,
    marketPrice: portfolio.protectionPrice,
    balance: portfolio.balance,
    // The form prices sells off the SELECTED round's cost basis; other
    // rounds' positions stay visible only in the holdings panel.
    positions: portfolio.positions.filter(
      (position) => position.symbol === selectedSymbol,
    ),
    availableQuantity: portfolio.availableQuantity,
    isRoundTradable: rounds.isRoundTradable,
    isRegionRestricted,
  });

  const bookView = usePredictionOrderBookView({
    book: orderbook.book,
    selectedOutcome: form.selectedOutcome,
    orderSide: form.orderSide,
    orderQuantity: form.orderQuantity,
    orderType: form.orderType,
    slippage,
  });

  const canPlaceOrder =
    form.canPlaceOrder &&
    !bookView.isSlippageExceeded &&
    // Fail closed without a valid binary fee config (never "free").
    portfolio.hasFeeConfig;

  const goToLiveRound = useCallback(() => {
    rounds.goToLiveRound();
  }, [rounds]);

  const placeOrder = useCallback(() => {
    portfolio.placeOrder({
      canPlaceOrder,
      orderSide: form.orderSide,
      orderType: form.orderType,
      selectedOutcome: form.selectedOutcome,
      selectedPrice: form.selectedPrice,
      orderQuantity: form.orderQuantity,
      onResetAmountAfterFill: form.resetAmountAfterFill,
      clearNotification,
    });
  }, [
    canPlaceOrder,
    clearNotification,
    form.orderQuantity,
    form.orderSide,
    form.orderType,
    form.resetAmountAfterFill,
    form.selectedOutcome,
    form.selectedPrice,
    portfolio.placeOrder,
  ]);

  const placeOneTapOrder = useCallback(
    (
      outcome: Parameters<typeof portfolio.placeOneTapOrder>[0],
      quoteAmount: number,
    ) => {
      portfolio.placeOneTapOrder(outcome, quoteAmount, clearNotification);
    },
    [clearNotification, portfolio.placeOneTapOrder],
  );

  /**
   * One-tap mirrors the form's composed gate: the portfolio checks price,
   * funds and min_notional on the submitted protection price, and the book
   * walk (executable levels, not the mid) rejects sizes that would cross the
   * user's slippage setting — the mid-based estimate previously disabled
   * every two-sided book because protection ≥ mid by construction.
   */
  const canPlaceOneTapOrder = useCallback(
    (
      outcome: Parameters<typeof portfolio.canPlaceOneTapOrder>[0],
      quoteAmount: number,
    ) => {
      if (!portfolio.canPlaceOneTapOrder(outcome, quoteAmount)) return false;
      const quantity = portfolio.oneTapPayout(outcome, quoteAmount);
      if (quantity <= 0) return false;
      const estimated = bookView.estimateOrderSlippage(
        "buy",
        quantity,
        outcome,
      );
      return (
        estimated == null ||
        estimated <= new Decimal(slippage || 0).div(100).toNumber()
      );
    },
    [
      bookView.estimateOrderSlippage,
      portfolio.canPlaceOneTapOrder,
      portfolio.oneTapPayout,
      slippage,
    ],
  );

  return {
    rounds,
    markets: rounds.markets,
    market: rounds.market,
    marketId: rounds.marketId,
    marketInput: rounds.marketInput,
    selectMarket: rounds.selectMarket,
    isRoundsLoading: rounds.isLoading,
    /** True once the binary info snapshot produced at least one round. */
    isRoundsReady: rounds.round != null,
    // Round lifecycle. Components only mount after isRoundsReady, so the 0
    // fallbacks below never render.
    round: rounds.round ?? 0,
    roundPhase: rounds.roundPhase,
    selectedRound: rounds.selectedRound ?? rounds.round ?? 0,
    selectedRow: rounds.selectedRow,
    isRoundInSnapshot: rounds.isRoundInSnapshot,
    selectMarketRound: rounds.selectMarketRound,
    goToLiveRound,
    isRoundTradable: rounds.isRoundTradable,
    roundOutcomeLookup: rounds.roundOutcomeLookup,
    underlyingSymbol: rounds.underlyingSymbol,
    // Market data
    openingPrice: rounds.openingPrice ?? underlying.currentPrice,
    currentPrice: underlying.currentPrice,
    priceHistory: underlying.priceHistory,
    candles: underlying.candles,
    upChance: orderbook.upChance,
    outcomePrices: orderbook.outcomePrices,
    isBookLoading: orderbook.isBookLoading,
    hasBookQuote: orderbook.bbo.mid != null,
    // Order form
    selectedOutcome: form.selectedOutcome,
    setSelectedOutcome: form.setSelectedOutcome,
    orderSide: form.orderSide,
    setOrderSide: form.setOrderSide,
    orderType: form.orderType,
    setOrderType: form.setOrderType,
    amountUnit: form.amountUnit,
    setAmountUnit: form.setAmountUnit,
    amount: form.amount,
    setAmount: form.setAmount,
    limitPrice: form.limitPrice,
    setLimitPrice: form.setLimitPrice,
    selectedPrice: form.selectedPrice,
    selectedPosition: form.selectedPosition,
    estimatedContracts: form.estimatedContracts,
    estimatedPayout: form.estimatedPayout,
    estimatedProfit: form.estimatedProfit,
    odds: form.odds,
    orderQuantity: form.orderQuantity,
    orderNotional: form.orderNotional,
    maxAmount: form.maxAmount,
    maxQuoteAmount: form.maxQuoteAmount,
    maxOutcomeAmount: form.maxOutcomeAmount,
    orderPercentage: form.orderPercentage,
    setMaxAmount: form.setMaxAmount,
    setOrderPercentage: form.setOrderPercentage,
    canPlaceOrder,
    // Account domain
    balance: portfolio.balance,
    positions: portfolio.positions,
    openOrders: portfolio.openOrders,
    history: portfolio.history,
    settlements: portfolio.settlements,
    feeRates: portfolio.feeRates,
    estimateFee: portfolio.estimateFee,
    estimateFrozen: portfolio.estimateFrozen,
    isRegionRestricted,
    activeTab,
    setActiveTab,
    // Order book view
    orderBook: bookView.orderBook,
    estimateOrderSlippage: bookView.estimateOrderSlippage,
    estimatedSlippage: bookView.estimatedSlippage,
    isSlippageExceeded: bookView.isSlippageExceeded,
    slippage,
    setSlippage,
    // Actions
    notification,
    clearNotification,
    placeOrder,
    oneTapPayout: portfolio.oneTapPayout,
    canPlaceOneTapOrder,
    placeOneTapOrder,
    availableQuantity: portfolio.availableQuantity,
    sellPosition: portfolio.sellPosition,
    editPendingOrder: portfolio.editPendingOrder,
    cancelOrder: portfolio.cancelOrder,
    cancelAllOrders: portfolio.cancelAllOrders,
    pendingOrdersComplete: portfolio.pendingOrdersComplete,
  };
};

export type PredictionState = ReturnType<typeof usePredictionScript>;
