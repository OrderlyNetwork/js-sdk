import { useCallback, useEffect, useMemo, useState } from "react";
import { Decimal } from "@orderly.network/utils";
import { binaryOutcomeMarkPrice } from "../binary/binaryMarkPrice";
import {
  binaryMaxQuoteInput,
  quoteToBinaryQuantity,
  splitBinaryQuantity,
} from "../binary/binaryOrderRules";
import { amountFromPercentage } from "../orderEntry/form/quantityPercentage";
import {
  clamp,
  type PredictionAmountUnit,
  type PredictionOrderSide,
  type PredictionOrderType,
  type PredictionOutcome,
  type PredictionPosition,
} from "../prediction.types";
import { floorToTick } from "../predictionShared";

const isOnTick = (value: number, tick: number) =>
  Number.isFinite(value) &&
  new Decimal(value).div(tick).isInteger() &&
  value > 0 &&
  value < 1;

export type UsePredictionOrderFormArgs = {
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
  quoteTick = 0.01,
  quoteMin = quoteTick,
  quoteMax = new Decimal(1).sub(quoteTick).toNumber(),
  baseTick = 0.01,
  baseMin = baseTick,
  baseMax = 10000,
  minNotional = 5,
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
  const displayMin =
    selectedOutcome === "up"
      ? quoteMin
      : new Decimal(1).sub(quoteMax).toNumber();
  const displayMax =
    selectedOutcome === "up"
      ? quoteMax
      : new Decimal(1).sub(quoteMin).toNumber();

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
    if (
      numericAmount <= 0 ||
      selectedPrice < displayMin ||
      selectedPrice > displayMax
    ) {
      return false;
    }
    if (orderQuantity < baseMin || !Number.isFinite(selectedPrice))
      return false;
    if (orderType === "limit" && !isOnTick(selectedPrice, quoteTick))
      return false;
    // min_notional is validated on the UP-book order price for both sides,
    // entries and reduce-only exits alike (api-spec §5.2); a DOWN order at
    // display n checks (1-n)*qty, not n*qty.
    const upNotional = new Decimal(orderQuantity).mul(
      selectedOutcome === "up"
        ? selectedPrice
        : new Decimal(1).sub(selectedPrice).toNumber(),
    );
    if (
      !upNotional.gte(minNotional) ||
      !splitBinaryQuantity(
        orderQuantity,
        selectedOutcome === "up"
          ? selectedPrice
          : new Decimal(1).sub(selectedPrice).toNumber(),
        {
          base_tick: baseTick,
          base_min: baseMin,
          base_max: baseMax,
          min_notional: minNotional,
        },
      )
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
