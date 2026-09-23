import { useCallback, useState } from "react";
import { usePredictionMarketSimulation } from "./hooks/usePredictionMarketSimulation";
import { usePredictionNotifications } from "./hooks/usePredictionNotifications";
import { usePredictionOrderBook } from "./hooks/usePredictionOrderBook";
import { usePredictionOrderForm } from "./hooks/usePredictionOrderForm";
import { usePredictionPortfolio } from "./hooks/usePredictionPortfolio";
import { usePredictionRoundLifecycle } from "./hooks/usePredictionRoundLifecycle";
import type { PredictionDataTab } from "./prediction.types";
import type { PredictionOrderPolicy } from "./predictionExecution";

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
  PredictionMockPerpPosition,
  PredictionMockTransaction,
  PredictionChartPoint,
  PredictionOrderBookLevel,
} from "./prediction.types";

export const usePredictionScript = (
  regionRestricted = false,
  // When false the per-second simulation stays suspended; the shared provider
  // toggles it so unrelated routes do not tick the prototype market.
  active = true,
) => {
  const isRegionRestricted = regionRestricted;
  const [activeTab, setActiveTab] = useState<PredictionDataTab>("predictions");
  const orderPolicy: PredictionOrderPolicy = "gtc";

  const { notification, notify, clearNotification } =
    usePredictionNotifications();

  const round = usePredictionRoundLifecycle({
    onClearNotification: clearNotification,
  });

  const market = usePredictionMarketSimulation({
    active,
    roundPhase: round.roundPhase,
    openingPrice: round.openingPrice,
    countdown: round.countdown,
    onTradingSecond: round.tickCountdown,
  });

  const onActiveTab = useCallback((tab: PredictionDataTab) => {
    setActiveTab(tab);
  }, []);

  const portfolio = usePredictionPortfolio({
    notify,
    isRegionRestricted,
    isRoundTradable: round.isRoundTradable,
    selectedRound: round.selectedRound,
    round: round.round,
    currentPrice: market.currentPrice,
    openingPrice: round.openingPrice,
    outcomePrices: market.outcomePrices,
    onActiveTab,
    onAdvanceAfterSettle: round.advanceAfterSettle,
  });

  const form = usePredictionOrderForm({
    outcomePrices: market.outcomePrices,
    balance: portfolio.balance,
    positions: portfolio.positions,
    availableQuantity: portfolio.availableQuantity,
    isRoundTradable: round.isRoundTradable,
    isRegionRestricted,
  });

  const book = usePredictionOrderBook({
    selectedMarketPrice: form.selectedMarketPrice,
    outcomePrices: market.outcomePrices,
    selectedOutcome: form.selectedOutcome,
    orderSide: form.orderSide,
    orderQuantity: form.orderQuantity,
    orderType: form.orderType,
    slippage: portfolio.slippage,
  });

  const canPlaceOrder = form.canPlaceOrder && !book.isSlippageExceeded;

  const goToLiveRound = useCallback(() => {
    round.goToLiveRound(market.currentPrice);
    market.resetPriceHistory(market.currentPrice);
  }, [market.currentPrice, market.resetPriceHistory, round.goToLiveRound]);

  const placeOrder = useCallback(() => {
    portfolio.placeOrder({
      canPlaceOrder,
      orderSide: form.orderSide,
      orderType: form.orderType,
      orderPolicy,
      selectedOutcome: form.selectedOutcome,
      selectedPrice: form.selectedPrice,
      orderQuantity: form.orderQuantity,
      orderBook: book.orderBook,
      selectedPosition: form.selectedPosition,
      onResetAmountAfterFill: form.resetAmountAfterFill,
      clearNotification,
    });
  }, [
    book.orderBook,
    canPlaceOrder,
    clearNotification,
    form.orderQuantity,
    form.orderSide,
    form.orderType,
    form.resetAmountAfterFill,
    form.selectedOutcome,
    form.selectedPosition,
    form.selectedPrice,
    orderPolicy,
    portfolio.placeOrder,
  ]);

  return {
    round: round.round,
    countdown: round.countdown,
    roundPhase: round.roundPhase,
    selectedRound: round.selectedRound,
    selectMarketRound: round.selectMarketRound,
    goToLiveRound,
    isRoundTradable: round.isRoundTradable,
    openingPrice: round.openingPrice,
    currentPrice: market.currentPrice,
    priceHistory: market.priceHistory,
    upChance: market.upChance,
    outcomePrices: market.outcomePrices,
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
    balance: portfolio.balance,
    positions: portfolio.positions,
    openOrders: portfolio.openOrders,
    history: portfolio.history,
    settlements: portfolio.settlements,
    mockPerpPositions: portfolio.mockPerpPositions,
    closeMockPerpPosition: portfolio.closeMockPerpPosition,
    reverseMockPerpPosition: portfolio.reverseMockPerpPosition,
    mockTransactions: portfolio.mockTransactions,
    isRegionRestricted,
    activeTab,
    setActiveTab,
    orderBook: book.orderBook,
    estimateOrderSlippage: book.estimateOrderSlippage,
    slippage: portfolio.slippage,
    setSlippage: portfolio.setSlippage,
    estimatedSlippage: book.estimatedSlippage,
    isSlippageExceeded: book.isSlippageExceeded,
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
    canPlaceOrder,
    notification,
    clearNotification,
    placeOrder,
    availableQuantity: portfolio.availableQuantity,
    sellPosition: portfolio.sellPosition,
    editPendingOrder: portfolio.editPendingOrder,
    cancelOrder: portfolio.cancelOrder,
    cancelAllOrders: portfolio.cancelAllOrders,
    setMaxAmount: form.setMaxAmount,
    setOrderPercentage: form.setOrderPercentage,
    settleRound: portfolio.settleRound,
  };
};

export type PredictionState = ReturnType<typeof usePredictionScript>;
