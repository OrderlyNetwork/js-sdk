import { useCallback, useEffect, useMemo, useState } from "react";
import { Decimal } from "@orderly.network/utils";
import { binaryOutcomeMarkPrice } from "../binary/binaryMarkPrice";
import {
  binaryMaxQuoteInput,
  complementPrice,
  DEFAULT_BINARY_BASE_MAX,
  DEFAULT_BINARY_BASE_TICK,
  DEFAULT_BINARY_MIN_NOTIONAL,
  DEFAULT_BINARY_QUOTE_TICK,
  quoteToBinaryQuantity,
  resolveBinaryOrderLimits,
  splitBinaryQuantity,
  validateBinaryOrderSize,
} from "../binary/binaryOrderRules";
import { amountFromPercentage } from "../orderEntry/form/quantityPercentage";
import type {
  PredictionAmountUnit,
  PredictionOrderSide,
  PredictionOrderType,
  PredictionOutcome,
  PredictionPosition,
} from "../prediction.types";
import { clamp, floorToTick } from "../predictionShared";

export type UsePredictionOrderFormArgs = {
  /** Market family ID, e.g. `PERP_BTC5M_USDC`, shared across rounds; not a tradable round symbol. */
  marketId?: string;
  /** UP-coordinate mark price used only to estimate capacity for an empty limit input. */
  markPrice?: number;
  quoteTick?: number;
  quoteMin?: number;
  quoteMax?: number;
  baseTick?: number;
  baseMin?: number;
  baseMax?: number;
  minNotional?: number;
  executablePrices: Record<
    PredictionOrderSide,
    Record<PredictionOutcome, number | undefined>
  >;
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
  markPrice,
  quoteTick = DEFAULT_BINARY_QUOTE_TICK,
  quoteMin = quoteTick,
  quoteMax = complementPrice(quoteTick),
  baseTick = DEFAULT_BINARY_BASE_TICK,
  baseMin = baseTick,
  baseMax = DEFAULT_BINARY_BASE_MAX,
  minNotional = DEFAULT_BINARY_MIN_NOTIONAL,
  executablePrices,
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
  const amountUnit: PredictionAmountUnit =
    orderSide === "buy" ? "quote" : "outcome";
  const [tradeMode, setTradeMode] = useState<"oneTap" | "market" | "limit">(
    "oneTap",
  );
  const [amount, setAmount] = useState("");
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null,
  );
  const [limitPrice, setLimitPrice] = useState("");
  const priceDp = new Decimal(quoteTick).decimalPlaces();
  const amountDp =
    amountUnit === "quote" ? 2 : new Decimal(baseTick).decimalPlaces();
  const [formMarketId, setFormMarketId] = useState(marketId);

  useEffect(() => {
    if (formMarketId === marketId) return;
    setFormMarketId(marketId);
    setSelectedOutcome("up");
    setOrderSide("buy");
    setOrderType("market");
    setTradeMode("oneTap");
    setAmount("");
    setSelectedPercentage(null);
    setLimitPrice("");
  }, [formMarketId, marketId]);

  const selectedMarketPrice = executablePrices[orderSide][selectedOutcome];
  const rawSelectedPrice =
    orderType === "limit"
      ? Number(limitPrice) || 0
      : (marketPrice(selectedOutcome, orderSide) ?? 0);
  const selectedPrice = Number.isFinite(rawSelectedPrice)
    ? rawSelectedPrice
    : 0;

  // Capacity preview must not supply a price to the submitted order.
  const maxAmountPrice =
    orderType === "limit" && limitPrice.trim() === ""
      ? binaryOutcomeMarkPrice(markPrice, selectedOutcome)
      : selectedPrice;
  const hasMaxAmountEstimate =
    orderSide === "sell" ||
    (maxAmountPrice != null &&
      Number.isFinite(maxAmountPrice) &&
      maxAmountPrice > 0 &&
      maxAmountPrice < 1);

  const selectedPosition = positions.find(
    (position) => position.outcome === selectedOutcome,
  );

  const numericAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const orderQuantity = useMemo(() => {
    if (amountUnit === "outcome") return floorToTick(numericAmount, baseTick);
    if (!Number.isFinite(selectedPrice) || selectedPrice <= 0) return 0;
    return quoteToBinaryQuantity(amount, selectedPrice, baseTick);
  }, [amount, amountUnit, baseTick, numericAmount, selectedPrice]);

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
        orderSide === "buy"
          ? hasMaxAmountEstimate
            ? maxOpeningQuantity(selectedOutcome, maxAmountPrice!)
            : 0
          : selectedTokenBalance,
        baseTick,
      ),
    [
      baseTick,
      maxOpeningQuantity,
      orderSide,
      selectedOutcome,
      maxAmountPrice,
      hasMaxAmountEstimate,
      selectedTokenBalance,
    ],
  );
  const maxQuoteAmount = binaryMaxQuoteInput(
    maxOutcomeAmount,
    maxAmountPrice ?? 0,
    baseTick,
  );
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
    // Size/config gates run in UP-book coordinates (api-spec §5.2): a DOWN
    // order at display n is validated as UP at 1-n.
    const limits = resolveBinaryOrderLimits({
      quote_tick: quoteTick,
      quote_min: quoteMin,
      quote_max: quoteMax,
      base_tick: baseTick,
      base_min: baseMin,
      base_max: baseMax,
      min_notional: minNotional,
    });
    const upPrice =
      selectedOutcome === "up" ? selectedPrice : complementPrice(selectedPrice);
    // Market orders ride the tick-aligned protection price; only manually
    // typed limit prices need the quote-tick grid check.
    if (
      validateBinaryOrderSize({
        price: upPrice,
        quantity: orderQuantity,
        limits,
        requirePriceTickAligned: orderType === "limit",
      }) ||
      !splitBinaryQuantity(orderQuantity, upPrice, {
        base_tick: limits.baseTick,
        base_min: limits.baseMin,
        base_max: limits.baseMax,
        min_notional: limits.minNotional,
      })
    )
      return false;
    if (
      !/^\d+(\.\d+)?$/.test(amount) ||
      new Decimal(amount).decimalPlaces() > amountDp
    )
      return false;
    if (orderSide === "buy") {
      return requiredFrozen != null && requiredFrozen <= balance;
    }
    return orderQuantity <= selectedTokenBalance + 1e-9;
  }, [
    amount,
    amountDp,
    balance,
    baseMin,
    baseMax,
    baseTick,
    formMarketId,
    isRegionRestricted,
    isRoundTradable,
    marketId,
    minNotional,
    orderQuantity,
    quoteMin,
    quoteMax,
    quoteTick,
    requiredFrozen,
    orderSide,
    orderType,
    selectedOutcome,
    selectedPrice,
    selectedTokenBalance,
  ]);

  const setDefaultLimit = useCallback(
    (outcome: PredictionOutcome, side: PredictionOrderSide) => {
      const price = executablePrices[side][outcome];
      setLimitPrice(price == null ? "" : price.toFixed(priceDp));
    },
    [executablePrices, priceDp],
  );

  const selectOutcome = useCallback(
    (outcome: PredictionOutcome) => {
      setSelectedOutcome(outcome);
      setSelectedPercentage(null);
      setDefaultLimit(outcome, orderSide);
    },
    [orderSide, setDefaultLimit],
  );

  const selectOrderSide = useCallback(
    (side: PredictionOrderSide) => {
      if (side === orderSide) return;
      setOrderSide(side);
      setAmount("");
      setSelectedPercentage(null);
      setDefaultLimit(selectedOutcome, side);
    },
    [orderSide, selectedOutcome, setDefaultLimit],
  );

  const selectOrderType = useCallback(
    (type: PredictionOrderType) => {
      setOrderType(type);
      setTradeMode(type);
      if (type === "limit") setDefaultLimit(selectedOutcome, orderSide);
    },
    [orderSide, selectedOutcome, setDefaultLimit],
  );

  const selectTradeMode = useCallback(
    (mode: "oneTap" | "market" | "limit") => {
      setTradeMode(mode);
      setOrderType(mode === "oneTap" ? "market" : mode);
      if (mode === "oneTap") {
        setOrderSide("buy");
        setAmount("");
        setSelectedPercentage(null);
      }
      if (mode === "limit") setDefaultLimit(selectedOutcome, orderSide);
    },
    [orderSide, selectedOutcome, setDefaultLimit],
  );

  // Kept for callers using the previous public state; the side owns the unit.
  const selectAmountUnit = useCallback((unit: PredictionAmountUnit) => {
    void unit;
  }, []);

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
    setOrderSide: selectOrderSide,
    tradeMode,
    setTradeMode: selectTradeMode,
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
    maxAmountPrice,
    hasMaxAmountEstimate,
    maxQuoteAmount,
    maxOutcomeAmount,
    orderPercentage: selectedPercentage ?? orderPercentage,
    setOrderPercentage,
    setMaxAmount,
    canPlaceOrder,
    resetAmountAfterFill,
  };
};
