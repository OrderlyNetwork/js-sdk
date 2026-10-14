import { useCallback, useEffect, useMemo, useState } from "react";
import { Decimal } from "@orderly.network/utils";
import { binaryOutcomeMarkPrice } from "../binary/binaryMarkPrice";
import {
  binaryMaxQuoteInput,
  binaryMinimumOrderInput,
  complementPrice,
  DEFAULT_BINARY_BASE_MAX,
  DEFAULT_BINARY_BASE_TICK,
  DEFAULT_BINARY_MIN_NOTIONAL,
  DEFAULT_BINARY_QUOTE_TICK,
  quoteToBinaryQuantity,
  resolveBinaryOrderLimits,
  splitBinaryQuantity,
  totalToBinaryAmount,
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

export type PredictionOrderValidationError = {
  field: "price" | "amount" | "total";
  key:
    | "prediction.invalidOrder"
    | "orderEntry.total.error.min"
    | "prediction.message.downMinimumOrder"
    | "orderEntry.orderPrice.error.required"
    | "orderEntry.orderQuantity.error.required"
    | "orderEntry.orderQuantity.error.min"
    | "prediction.message.noExecutableQuotes"
    | "prediction.message.insufficientBalance"
    | "prediction.message.insufficientContracts"
    | "prediction.message.slippageExceeded";
  value?: number;
  minQuantity?: number;
  minTotal?: number;
  upPrice?: number;
};

export type UsePredictionOrderFormArgs = {
  /** Market family ID, e.g. `PERP_BTC5M_USDC`, shared across rounds; not a tradable round symbol. */
  marketId?: string;
  symbol?: string;
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
  /** Returns undefined when account or round inputs are unavailable. */
  maxOpeningQuantity: (
    outcome: PredictionOutcome,
    displayPrice: number,
  ) => number | undefined;
  positions: PredictionPosition[];
  availableQuantity: (outcome: PredictionOutcome, excludeId?: number) => number;
  isRoundTradable: boolean;
  isRegionRestricted: boolean;
};

export const usePredictionOrderForm = ({
  marketId,
  symbol,
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
  /** Raw Total-value draft while the total input is the edit anchor; null = derived display. */
  const [totalInput, setTotalInput] = useState<string | null>(null);
  const priceDp = new Decimal(quoteTick).decimalPlaces();
  const amountDp =
    amountUnit === "quote" ? 2 : new Decimal(baseTick).decimalPlaces();
  const [formSymbol, setFormSymbol] = useState(symbol);
  useEffect(() => {
    if (formSymbol === symbol) return;
    setFormSymbol(symbol);
    setAmount("");
    setSelectedPercentage(null);
    setLimitPrice("");
    setTotalInput(null);
  }, [formSymbol, symbol]);

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
    setTotalInput(null);
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
  const hasMaxAmountPrice =
    maxAmountPrice != null &&
    Number.isFinite(maxAmountPrice) &&
    maxAmountPrice > 0 &&
    maxAmountPrice < 1;

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
  const maxOutcomeAmountEstimate = useMemo(
    () =>
      orderSide === "buy"
        ? hasMaxAmountPrice
          ? maxOpeningQuantity(selectedOutcome, maxAmountPrice!)
          : undefined
        : selectedTokenBalance,
    [
      maxOpeningQuantity,
      orderSide,
      selectedOutcome,
      maxAmountPrice,
      hasMaxAmountPrice,
      selectedTokenBalance,
    ],
  );
  const hasMaxAmountEstimate =
    maxOutcomeAmountEstimate != null &&
    Number.isFinite(maxOutcomeAmountEstimate) &&
    maxOutcomeAmountEstimate >= 0;
  const maxOutcomeAmount = hasMaxAmountEstimate
    ? floorToTick(maxOutcomeAmountEstimate!, baseTick)
    : 0;
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

  const orderValidationError = useMemo<
    PredictionOrderValidationError | undefined
  >(() => {
    if (selectedPrice <= 0) {
      return {
        field: "price",
        key:
          orderType === "limit"
            ? "orderEntry.orderPrice.error.required"
            : "prediction.message.noExecutableQuotes",
      };
    }
    if (!/^\d+(\.\d+)?$/.test(amount) || numericAmount <= 0) {
      return {
        field: "amount",
        key: "orderEntry.orderQuantity.error.required",
      };
    }
    if (new Decimal(amount).decimalPlaces() > amountDp) {
      return { field: "amount", key: "prediction.invalidOrder" };
    }
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
    const rejection = validateBinaryOrderSize({
      price: upPrice,
      quantity: orderQuantity,
      limits,
      reduceOnly: orderSide === "sell",
      requirePriceTickAligned: orderType === "limit",
    });
    if (rejection === "notionalBelowMin") {
      if (
        orderType === "limit" &&
        orderSide === "buy" &&
        selectedOutcome === "down"
      ) {
        return {
          field: "total",
          key: "prediction.message.downMinimumOrder",
          value: limits.minNotional,
          upPrice,
          ...binaryMinimumOrderInput(selectedPrice, selectedOutcome, limits),
        };
      }
      return {
        field: "total",
        key: "orderEntry.total.error.min",
        value: limits.minNotional,
      };
    }
    if (rejection === "quantityBelowMin") {
      return {
        field: "amount",
        key: "orderEntry.orderQuantity.error.min",
        value: limits.baseMin,
      };
    }
    if (rejection) return { field: "price", key: "prediction.invalidOrder" };
    if (
      !splitBinaryQuantity(
        orderQuantity,
        upPrice,
        {
          base_tick: limits.baseTick,
          base_min: limits.baseMin,
          base_max: limits.baseMax,
          min_notional: limits.minNotional,
        },
        orderSide === "sell",
      )
    )
      return { field: "amount", key: "prediction.invalidOrder" };
    if (
      orderSide === "buy" &&
      (requiredFrozen == null || !(requiredFrozen <= balance))
    ) {
      return { field: "amount", key: "prediction.message.insufficientBalance" };
    }
    if (
      orderSide === "sell" &&
      !(orderQuantity <= selectedTokenBalance + 1e-9)
    ) {
      return {
        field: "amount",
        key: "prediction.message.insufficientContracts",
      };
    }
    return undefined;
  }, [
    amount,
    amountDp,
    numericAmount,
    balance,
    baseMin,
    baseMax,
    baseTick,
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

  const canPlaceOrder =
    isRoundTradable &&
    !isRegionRestricted &&
    formMarketId === marketId &&
    formSymbol === symbol &&
    !orderValidationError;

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
      setTotalInput(null);
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
        setTotalInput(null);
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
      if (!hasMaxAmountEstimate) return;
      const nextPercentage = clamp(percentage, 0, 100);
      setSelectedPercentage(nextPercentage);
      setTotalInput(null);
      setAmount(amountFromPercentage(maxAmount, nextPercentage, amountDp));
    },
    [amountDp, hasMaxAmountEstimate, maxAmount],
  );

  useEffect(() => {
    if (
      formMarketId === marketId &&
      formSymbol === symbol &&
      selectedPercentage !== null
    ) {
      setOrderPercentage(selectedPercentage);
    }
  }, [
    formMarketId,
    marketId,
    formSymbol,
    symbol,
    selectedPercentage,
    setOrderPercentage,
  ]);

  const setManualAmount = useCallback((value: string) => {
    setSelectedPercentage(null);
    setTotalInput(null);
    setAmount(value);
  }, []);

  const setTotal = useCallback(
    (value: string) => {
      setSelectedPercentage(null);
      setTotalInput(value);
      setAmount(
        totalToBinaryAmount(value, amountUnit, selectedPrice, baseTick),
      );
    },
    [amountUnit, selectedPrice, baseTick],
  );

  // While the total input is the edit anchor, price/unit changes re-derive the
  // amount from the typed total (perp order-entry lastChangedField semantics).
  useEffect(() => {
    // Reset effects above clear drafts when the selection changes. Do not
    // write a total captured from the previous selection back after that reset.
    if (
      totalInput == null ||
      formMarketId !== marketId ||
      formSymbol !== symbol
    ) {
      return;
    }
    setAmount(
      totalToBinaryAmount(totalInput, amountUnit, selectedPrice, baseTick),
    );
  }, [
    totalInput,
    amountUnit,
    selectedPrice,
    baseTick,
    formMarketId,
    marketId,
    formSymbol,
    symbol,
  ]);

  const setMaxAmount = useCallback(() => {
    setOrderPercentage(100);
  }, [setOrderPercentage]);

  const resetAmountAfterFill = useCallback(() => {
    setSelectedPercentage(null);
    setTotalInput(null);
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
    totalInput,
    setTotal,
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
    orderValidationError,
    resetAmountAfterFill,
  };
};
