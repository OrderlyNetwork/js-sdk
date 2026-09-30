import { useMemo, useState } from "react";
import { Decimal } from "@orderly.network/utils";
import type {
  PredictionOutcome,
  PredictionOrderType,
  PredictionState,
} from "../../prediction.script";
import {
  percentageFromQuantity,
  quantityFromPercentage,
} from "../form/quantityPercentage";

export type UseSellPositionScriptArgs = {
  state: PredictionState;
  outcome: PredictionOutcome;
  /** Round symbol of the position row; defaults to the selected round. */
  symbol?: string;
};

export const useSellPositionScript = ({
  state,
  outcome,
  symbol,
}: UseSellPositionScriptArgs) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState<PredictionOrderType>("market");

  // Only the selected round's book drives protection prices; exits on other
  // rounds stay read-only until the user switches the chart to that round.
  const sellable = symbol == null || symbol === state.selectedRow?.symbol;
  const available = state.availableQuantity(outcome, undefined, symbol);
  const estimatedSlippage = useMemo(
    () => state.estimateOrderSlippage("sell", Number(quantity), outcome),
    [outcome, quantity, state],
  );
  const isSlippageExceeded =
    type === "market" &&
    estimatedSlippage !== null &&
    estimatedSlippage > new Decimal(state.slippage || 0).div(100).toNumber();
  const percentage = percentageFromQuantity(Number(quantity) || 0, available);

  const selectPercentage = (value: number) =>
    setQuantity(quantityFromPercentage(available, value, 4));

  const tradable =
    sellable && state.isRoundTradable && !state.isRegionRestricted;
  const valid =
    tradable &&
    Number(quantity) > 0 &&
    Number(quantity) <= available &&
    !isSlippageExceeded &&
    (type === "market" || (Number(price) > 0 && Number(price) < 1));

  const onOpenChange = (value: boolean) => {
    setOpen(value);
    if (value) {
      setQuantity(String(available));
      setPrice(state.outcomePrices[outcome].toFixed(2));
    }
  };

  const confirm = async () => {
    const placed = await state.sellPosition(
      outcome,
      Number(quantity),
      type,
      Number(price),
      symbol,
    );
    if (placed) {
      setOpen(false);
    }
  };

  return {
    open,
    onOpenChange,
    quantity,
    setQuantity,
    price,
    setPrice,
    type,
    setType,
    available,
    percentage,
    selectPercentage,
    estimatedSlippage,
    tradable,
    valid,
    confirm,
    outcome,
    slippage: state.slippage,
    setSlippage: state.setSlippage,
  };
};

export type SellPositionState = ReturnType<typeof useSellPositionScript>;
