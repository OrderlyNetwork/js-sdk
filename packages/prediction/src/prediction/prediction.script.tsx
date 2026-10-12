import { useCallback, useState } from "react";
import { useBinaryMarkPrice } from "./binary/useBinaryMarkPrice";
import { useBinaryRegionRestricted } from "./binary/useBinaryRegion";
import { useBinaryRounds } from "./binary/useBinaryRounds";
import { useBinaryUnderlying } from "./binary/useBinaryUnderlying";
import { usePredictionAccountResources } from "./hooks/usePredictionAccountResources";
import { usePredictionNotifications } from "./hooks/usePredictionNotifications";
import {
  usePredictionOrderBook,
  usePredictionOrderBookView,
} from "./hooks/usePredictionOrderBook";
import { usePredictionOrderForm } from "./hooks/usePredictionOrderForm";
import { usePredictionSlippage } from "./hooks/usePredictionSlippage";
import { usePredictionTradingActions } from "./hooks/usePredictionTradingActions";
import type { PredictionDataTab } from "./prediction.types";

export const usePredictionScript = (
  regionRestricted = false,
  // Page-scoped polling can be suspended by its caller.
  active = true,
  // Live market streams (orderbook/index WS) are only kept by the prediction
  // page itself; base consumers (perp/portfolio dropdowns, shared panels)
  // retain the cheap rounds polling but not the per-tick subscriptions.
  activeLive = true,
  selection: {
    symbol?: string;
    onSymbolSelect: (symbol: string) => void;
  },
) => {
  const binaryRegionRestricted = useBinaryRegionRestricted(active);
  const isRegionRestricted = regionRestricted || binaryRegionRestricted;
  const [activeTab, setActiveTab] = useState<PredictionDataTab>("predictions");
  const { slippage, setSlippage } = usePredictionSlippage();

  const { notification, notify, clearNotification } =
    usePredictionNotifications();

  const rounds = useBinaryRounds({ active, ...selection });
  const selectedSymbol = rounds.selectedRow?.symbol;

  const underlying = useBinaryUnderlying({
    indexSymbol: rounds.underlyingSymbol,
    roundStartSec: rounds.selectedRow ? rounds.selectedRound : undefined,
    expireAtMs: rounds.selectedRow?.expire_at,
    active: active && activeLive && !!rounds.selectedRow,
  });

  const markPrice = useBinaryMarkPrice(selectedSymbol, active && activeLive);

  const orderbook = usePredictionOrderBook({
    symbol: selectedSymbol,
    active: active && activeLive,
  });

  const onActiveTab = useCallback((tab: PredictionDataTab) => {
    setActiveTab(tab);
  }, []);

  const resources = usePredictionAccountResources({
    enabled: active,
    includeSettlementHistory: !rounds.isRoundTradable && !isRegionRestricted,
    nowMs: rounds.now,
  });
  const portfolio = usePredictionTradingActions({
    active,
    resources,
    binaryRows: rounds.rows,
    notify,
    isRegionRestricted,
    selectedSymbol,
    bbo: {
      bestAsk: orderbook.bbo.bestAsk,
      bestBid: orderbook.bbo.bestBid,
    },
    slippage,
    book: orderbook.book,
    onActiveTab,
  });

  const form = usePredictionOrderForm({
    markPrice,
    marketId: rounds.marketId,
    symbol: selectedSymbol,
    quoteTick: rounds.selectedRow?.quote_tick,
    quoteMin: rounds.selectedRow?.quote_min,
    quoteMax: rounds.selectedRow?.quote_max,
    baseTick: rounds.selectedRow?.base_tick,
    baseMin: rounds.selectedRow?.base_min,
    baseMax: rounds.selectedRow?.base_max,
    minNotional: rounds.selectedRow?.min_notional,
    executablePrices: orderbook.executablePrices,
    marketPrice: portfolio.protectionPrice,
    balance: portfolio.balance,
    estimateAdditionalFrozen: portfolio.estimateAdditionalFrozen,
    maxOpeningQuantity: portfolio.maxOpeningQuantity,
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
    quoteTick: rounds.selectedRow?.quote_tick,
  });

  const canPlaceOrder =
    form.canPlaceOrder &&
    !bookView.isSlippageExceeded &&
    // Fail closed without a valid binary fee config (never "free").
    portfolio.hasFeeConfig &&
    portfolio.accountReady &&
    !portfolio.isSubmitting;

  const goToLiveRound = useCallback(() => {
    rounds.goToLiveRound();
  }, [rounds]);
  // Rounds outside their trading window are rejected by the rounds hook;
  // surface that instead of silently dropping the click.
  const selectMarketRound = useCallback(
    (round: number) => {
      if (rounds.selectMarketRound(round)) return;
      notify("prediction.rounds.notOpenYet", "danger");
    },
    [rounds.selectMarketRound, notify],
  );
  const goToNextRound = rounds.goToNextRound;

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
    ) => portfolio.placeOneTapOrder(outcome, quoteAmount, clearNotification),
    [clearNotification, portfolio.placeOneTapOrder],
  );

  return {
    rounds,
    markets: rounds.markets,
    market: rounds.market,
    requestedMarket: rounds.requestedMarket,
    isMissingHistoricalRound: rounds.isMissingHistoricalRound,
    canGoToLiveRound: rounds.canGoToLiveRound,
    marketId: rounds.marketId,
    defaultSymbol: rounds.defaultSymbol,
    isRoundsLoading: rounds.isLoading,
    /** A real round or an identifiable missing historical round can render. */
    isRoundsReady:
      rounds.selectedRow != null || rounds.isMissingHistoricalRound,
    // Missing historical rounds retain their timestamp from the route symbol.
    round: rounds.round ?? rounds.selectedRound ?? 0,
    roundPhase: rounds.roundPhase,
    selectedRound: rounds.selectedRound ?? rounds.round ?? 0,
    selectedRow: rounds.selectedRow,
    roundDetailError: rounds.detailError,
    roundDetailLoading: rounds.detailLoading,
    refreshRoundDetail: rounds.refreshDetail,
    nextTradableRow: rounds.nextTradableRow,
    goToNextRound,
    marketRows: rounds.marketRows,
    isRoundInSnapshot: rounds.isRoundInSnapshot,
    selectMarketRound,
    goToLiveRound,
    isRoundTradable: rounds.isRoundTradable,
    roundOutcomeLookup: rounds.roundOutcomeLookup,
    underlyingSymbol: rounds.underlyingSymbol,
    // Market data
    openingPrice: rounds.openingPrice,
    chartIndexPrice: underlying.chartIndexPrice,
    currentPrice: underlying.currentPrice,
    priceHistory: underlying.priceHistory,
    candles: underlying.candles,
    markPrice,
    upChance: orderbook.upChance,
    outcomePrices: orderbook.outcomePrices,
    executablePrices: orderbook.executablePrices,
    isBookLoading: orderbook.isBookLoading,
    hasBookQuote: orderbook.bbo.mid != null,
    // Order form
    orderValidationError:
      form.orderValidationError ??
      (bookView.isSlippageExceeded
        ? {
            field: "amount" as const,
            key: "prediction.message.slippageExceeded" as const,
          }
        : undefined),
    selectedOutcome: form.selectedOutcome,
    setSelectedOutcome: form.setSelectedOutcome,
    orderSide: form.orderSide,
    setOrderSide: form.setOrderSide,
    tradeMode: form.tradeMode,
    setTradeMode: form.setTradeMode,
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
    requiredFrozen: form.requiredFrozen,
    fundingEstimateMode: portfolio.fundingEstimateMode,
    maxAmount: form.maxAmount,
    maxAmountPrice: form.maxAmountPrice,
    hasMaxAmountEstimate: form.hasMaxAmountEstimate,
    maxQuoteAmount: form.maxQuoteAmount,
    maxOutcomeAmount: form.maxOutcomeAmount,
    orderPercentage: form.orderPercentage,
    setMaxAmount: form.setMaxAmount,
    setOrderPercentage: form.setOrderPercentage,
    canPlaceOrder,
    // Account domain
    ordersLoading: resources.ordersLoading,
    ordersError: resources.ordersError,
    positionsLoading: resources.positionsLoading,
    positionsError: resources.positionsError,
    balance: portfolio.balance,
    positions: portfolio.positions,
    openOrders: portfolio.openOrders,
    history: portfolio.history,
    settlements: portfolio.settlements,
    historyRecords: portfolio.historyRecords,
    historyLoading: portfolio.historyLoading,
    historyError: portfolio.historyError,
    pendingSettlementSymbols: portfolio.pendingSettlementSymbols,
    accountId: portfolio.accountId,
    feeRates: portfolio.feeRates,
    estimateFee: portfolio.estimateFee,
    isRegionRestricted,
    accountReady: portfolio.accountReady,
    hasFeeConfig: portfolio.hasFeeConfig,
    protectionPrice: portfolio.protectionPrice,
    isSubmitting: portfolio.isSubmitting,
    isOrderTradable: portfolio.isOrderTradable,
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
    evaluateOneTapOrder: portfolio.evaluateOneTapOrder,
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
