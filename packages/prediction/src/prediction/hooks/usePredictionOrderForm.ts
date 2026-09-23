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

export type UsePredictionOrderFormArgs = {
  outcomePrices: Record<PredictionOutcome, number>;
  balance: number;
  positions: PredictionPosition[];
  availableQuantity: (outcome: PredictionOutcome, excludeId?: number) => number;
  isRoundTradable: boolean;
  isRegionRestricted: boolean;
};

export const usePredictionOrderForm = ({
  outcomePrices,
  balance,
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
  const [limitPrice, setLimitPrice] = useState("0.5000");

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

  const canPlaceOrder = useMemo(() => {
    if (!isRoundTradable || isRegionRestricted) return false;
    if (numericAmount <= 0 || selectedPrice <= 0 || selectedPrice >= 1) {
      return false;
    }
    if (orderSide === "buy") return orderNotional <= balance;
    return orderQuantity <= selectedTokenBalance;
  }, [
    balance,
    isRegionRestricted,
    isRoundTradable,
    numericAmount,
    orderNotional,
    orderQuantity,
    orderSide,
    selectedPrice,
    selectedTokenBalance,
  ]);

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

  const setOrderPercentage = useCallback(
    (percentage: number) => {
      const nextPercentage = clamp(percentage, 0, 100);
      setSelectedPercentage(nextPercentage);
      setAmount(
        amountFromPercentage(
          maxAmount,
          nextPercentage,
          amountUnit === "quote" ? 2 : 4,
        ),
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
