import { useCallback, useEffect, useMemo, useState } from "react";
import { Decimal } from "@orderly.network/utils";
import { amountFromPercentage } from "../orderEntry/form/quantityPercentage";
import {
  clamp,
  type PredictionAmountUnit,
  type PredictionOrderSide,
  type PredictionOrderType,
  type PredictionOutcome,
  type PredictionPosition,
} from "../prediction.types";
import { EMPTY_BOOK_FALLBACK_PRICE, floorToTick } from "../predictionShared";

const isOnTick = (value: number, tick: number) =>
  Number.isFinite(value) &&
  new Decimal(value).div(tick).isInteger() &&
  value > 0 &&
  value < 1;

export type UsePredictionOrderFormArgs = {
  marketId?: string;
  quoteTick?: number;
  quoteMin?: number;
  quoteMax?: number;
  baseTick?: number;
  baseMin?: number;
  baseMax?: number;
  minNotional?: number;
  outcomePrices: Record<PredictionOutcome, number>;
  /** Protection price a MARKET order submits as its IOC limit (PRD §6.4). */
  marketPrice: (
    outcome: PredictionOutcome,
    side: PredictionOrderSide,
  ) => number | undefined;
  balance: number;
  estimateAdditionalFrozen: (
    outcome: PredictionOutcome,
    quantity: number,
    displayPrice: number,
  ) => number | undefined;
  maxOpeningQuantity: (
    outcome: PredictionOutcome,
    displayPrice: number,
  ) => number;
  positions: PredictionPosition[];
  availableQuantity: (outcome: PredictionOutcome, excludeId?: number) => number;
  isRoundTradable: boolean;
  isRegionRestricted: boolean;
};

export const usePredictionOrderForm = ({
  marketId,
  quoteTick = 0.01,
  quoteMin = quoteTick,
  quoteMax = 1 - quoteTick,
  baseTick = 0.01,
  baseMin = baseTick,
  baseMax = 10000,
  minNotional = 5,
  outcomePrices,
  marketPrice,
  balance,
  estimateAdditionalFrozen,
  maxOpeningQuantity,
  availableQuantity,
  isRoundTradable,
  isRegionRestricted,
  positions,
}: UsePredictionOrderFormArgs) => {
  const [selectedOutcome, setSelectedOutcome] =
    useState<PredictionOutcome>("up");
  const [orderSide, setOrderSide] = useState<PredictionOrderSide>("buy");
  const [orderType, setOrderType] = useState<PredictionOrderType>("market");
  const [amountUnit, setAmountUnit] = useState<PredictionAmountUnit>("quote");
  const [amount, setAmount] = useState("100");
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null,
  );
  const [limitPrice, setLimitPrice] = useState("0.50");
  const priceDp = new Decimal(quoteTick).decimalPlaces();
  const amountDp =
    amountUnit === "quote" ? priceDp : new Decimal(baseTick).decimalPlaces();
  const [formMarketId, setFormMarketId] = useState(marketId);

  useEffect(() => {
    if (formMarketId === marketId) return;
    setFormMarketId(marketId);
    setSelectedOutcome("up");
    setOrderSide("buy");
    setOrderType("market");
    setAmountUnit("quote");
    setAmount("");
    setSelectedPercentage(null);
    setLimitPrice("0.50");
  }, [formMarketId, marketId]);

  const selectedMarketPrice = outcomePrices[selectedOutcome];
  // MARKET uses the submitted IOC protection price, including the 0.5
  // fallback on an empty executable side. LIMIT keeps the user-picked price.
  // Max, percentage amounts and funds validation must use this same price.
  const rawSelectedPrice =
    orderType === "limit"
      ? Number(limitPrice) || 0
      : (marketPrice(selectedOutcome, orderSide) ?? EMPTY_BOOK_FALLBACK_PRICE);
  const selectedPrice = Number.isFinite(rawSelectedPrice)
    ? rawSelectedPrice
    : 0;
  const displayMin =
    selectedOutcome === "up"
      ? quoteMin
      : new Decimal(1).sub(quoteMax).toNumber();
  const displayMax =
    selectedOutcome === "up"
      ? quoteMax
      : new Decimal(1).sub(quoteMin).toNumber();

  const selectedPosition = positions.find(
    (position) => position.outcome === selectedOutcome,
  );

  const numericAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const orderQuantity = useMemo(() => {
    if (amountUnit === "outcome") return floorToTick(numericAmount, baseTick);
    if (!Number.isFinite(selectedPrice) || selectedPrice <= 0) return 0;
    return floorToTick(
      new Decimal(numericAmount).div(selectedPrice).toNumber(),
      baseTick,
    );
  }, [amountUnit, baseTick, numericAmount, selectedPrice]);

  const orderNotional = useMemo(
    () => new Decimal(orderQuantity).mul(selectedPrice).toNumber(),
    [orderQuantity, selectedPrice],
  );

  const estimatedContracts = orderQuantity;
  const estimatedPayout = estimatedContracts;
  const estimatedProfit =
    orderSide === "buy"
      ? new Decimal(estimatedPayout).sub(orderNotional).toNumber()
      : selectedPosition
        ? new Decimal(selectedPrice)
            .sub(selectedPosition.averagePrice)
            .mul(orderQuantity)
            .toNumber()
        : 0;
  const odds =
    selectedPrice > 0 ? new Decimal(1).div(selectedPrice).toNumber() : 0;

  const selectedTokenBalance = availableQuantity(selectedOutcome);
  const maxOutcomeAmount = useMemo(
    () =>
      floorToTick(
        Math.min(
          baseMax,
          orderSide === "buy"
            ? maxOpeningQuantity(selectedOutcome, selectedPrice)
            : selectedTokenBalance,
        ),
        baseTick,
      ),
    [
      baseMax,
      baseTick,
      maxOpeningQuantity,
      orderSide,
      selectedOutcome,
      selectedPrice,
      selectedTokenBalance,
    ],
  );
  const maxQuoteAmount = new Decimal(maxOutcomeAmount)
    .mul(selectedPrice)
    .toNumber();
  const requiredFrozen =
    orderSide === "buy"
      ? estimateAdditionalFrozen(selectedOutcome, orderQuantity, selectedPrice)
      : 0;
  const maxAmount = amountUnit === "quote" ? maxQuoteAmount : maxOutcomeAmount;
  const orderPercentage =
    maxAmount > 0 ? clamp((numericAmount / maxAmount) * 100, 0, 100) : 0;

  const canPlaceOrder = useMemo(() => {
    if (!isRoundTradable || isRegionRestricted || formMarketId !== marketId)
      return false;
    if (
      numericAmount <= 0 ||
      selectedPrice < displayMin ||
      selectedPrice > displayMax
    ) {
      return false;
    }
    if (
      orderQuantity < baseMin ||
      orderQuantity > baseMax ||
      !Number.isFinite(selectedPrice)
    )
      return false;
    if (orderType === "limit" && !isOnTick(selectedPrice, quoteTick))
      return false;
    // min_notional is validated on the UP-book order price for both sides,
    // entries and reduce-only exits alike (api-spec §5.2); a DOWN order at
    // display n checks (1-n)*qty, not n*qty.
    const upNotional = new Decimal(orderQuantity).mul(
      selectedOutcome === "up" ? selectedPrice : 1 - selectedPrice,
    );
    if (!upNotional.gte(minNotional)) return false;
    if (orderSide === "buy") {
      return requiredFrozen != null && requiredFrozen <= balance;
    }
    return orderQuantity <= selectedTokenBalance + 1e-9;
  }, [
    balance,
    baseMin,
    baseMax,
    baseTick,
    displayMax,
    displayMin,
    formMarketId,
    isRegionRestricted,
    isRoundTradable,
    marketId,
    minNotional,
    numericAmount,
    orderNotional,
    orderQuantity,
    requiredFrozen,
    orderSide,
    orderType,
    quoteTick,
    selectedOutcome,
    selectedPrice,
    selectedTokenBalance,
  ]);

  const selectOutcome = useCallback(
    (outcome: PredictionOutcome) => {
      setSelectedOutcome(outcome);
      setLimitPrice(outcomePrices[outcome].toFixed(priceDp));
    },
    [outcomePrices, priceDp],
  );

  const selectOrderType = useCallback(
    (type: PredictionOrderType) => {
      setOrderType(type);
      if (type === "limit") {
        setAmountUnit("outcome");
        setLimitPrice(outcomePrices[selectedOutcome].toFixed(priceDp));
      }
    },
    [outcomePrices, priceDp, selectedOutcome],
  );

  const selectAmountUnit = useCallback(
    (unit: PredictionAmountUnit) => {
      if (unit === amountUnit) return;
      const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
      const converted =
        unit === "outcome"
          ? selectedPrice > 0
            ? new Decimal(value).div(selectedPrice).toNumber()
            : 0
          : new Decimal(value).mul(selectedPrice).toNumber();
      // Both units live on the 0.01 tick grid (USDC quote / share count).
      setAmountUnit(unit);
      setAmount(
        value > 0
          ? converted.toFixed(
              unit === "quote"
                ? priceDp
                : new Decimal(baseTick).decimalPlaces(),
            )
          : "",
      );
    },
    [amount, amountUnit, baseTick, priceDp, selectedPrice],
  );

  const setOrderPercentage = useCallback(
    (percentage: number) => {
      const nextPercentage = clamp(percentage, 0, 100);
      setSelectedPercentage(nextPercentage);
      setAmount(amountFromPercentage(maxAmount, nextPercentage, amountDp));
    },
    [amountDp, maxAmount],
  );

  useEffect(() => {
    if (formMarketId === marketId && selectedPercentage !== null) {
      setOrderPercentage(selectedPercentage);
    }
  }, [formMarketId, marketId, selectedPercentage, setOrderPercentage]);

  const setManualAmount = useCallback((value: string) => {
    setSelectedPercentage(null);
    setAmount(value);
  }, []);

  const setMaxAmount = useCallback(() => {
    setOrderPercentage(100);
  }, [setOrderPercentage]);

  const resetAmountAfterFill = useCallback(() => {
    setSelectedPercentage(null);
    setAmount("");
  }, []);

  return {
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
    selectedMarketPrice,
    selectedPrice,
    selectedPosition,
    orderQuantity,
    orderNotional,
    requiredFrozen,
    estimatedContracts,
    estimatedPayout,
    estimatedProfit,
    odds,
    maxAmount,
    maxQuoteAmount,
    maxOutcomeAmount,
    orderPercentage: selectedPercentage ?? orderPercentage,
    setOrderPercentage,
    setMaxAmount,
    canPlaceOrder,
    resetAmountAfterFill,
  };
};
