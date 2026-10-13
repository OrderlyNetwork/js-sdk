import { useEffect, useRef, useState, type RefObject } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import { toBinaryUpRequest } from "../binary/binaryOrderRules";
import type { BinaryFeeRates } from "../binary/useBinaryFeeRates";
import type { OneTapOrderEvaluation } from "../hooks/tradingActions/useOneTapOrders";
import type { PredictionOrderValidationError } from "../hooks/usePredictionOrderForm";
import type {
  PredictionAmountUnit,
  PredictionOrderSide,
  PredictionOrderType,
  PredictionOutcome,
} from "../prediction.types";
import {
  DEFAULT_ONE_TAP_AMOUNTS,
  alignOneTapAmounts,
  resolveOneTapAmounts,
  parseOneTapDraft,
  type OneTapAmounts,
} from "./oneTapAmounts";

export type PredictionTradeMode = "limit" | "market" | "oneTap";
/** Presentation inputs and commands consumed by the trade form. */
export interface TradePanelFormProps {
  tradeMode: PredictionTradeMode;
  setTradeMode(mode: PredictionTradeMode): void;
  orderSide: PredictionOrderSide;
  setOrderSide(side: PredictionOrderSide): void;
  orderType: PredictionOrderType;
  selectedOutcome: PredictionOutcome;
  setSelectedOutcome(outcome: PredictionOutcome): void;
  amountUnit: PredictionAmountUnit;
  balance: number;
  maxAmount: number;
  hasMaxAmountEstimate: boolean;
  isRoundTradable: boolean;
  isRegionRestricted: boolean;
  executablePrices: Record<
    PredictionOrderSide,
    Record<PredictionOutcome, number | undefined>
  >;
  selectedRow?: API.BinaryInfoRow;
  isSubmitting: boolean;
  placeOneTapOrder(outcome: PredictionOutcome, quoteAmount: number): void;
  limitPrice: string;
  setLimitPrice(value: string): void;
  amount: string;
  setAmount(value: string): void;
  /** Raw Total-value draft while the total input is the edit anchor; null = derived display. */
  totalInput: string | null;
  setTotal(value: string): void;
  orderQuantity: number;
  orderNotional: number;
  orderPercentage: number;
  setOrderPercentage(value: number): void;
  odds: number;
  estimatedPayout: number;
  canPlaceOrder: boolean;
  orderValidationError?: PredictionOrderValidationError;
  placeOrder(): void;
  slippage: string;
  setSlippage(value: string): void;
  estimatedSlippage: number | null;
  feeRates: BinaryFeeRates;
  requiredFrozen: number | undefined;
  fundingEstimateMode: "detailed" | "approximate" | "unavailable";
  orderEntryAccountReady?: boolean;
  orderEntryFunded?: boolean;
}
export interface TradePanelScriptInput extends TradePanelFormProps {
  selectedPrice: number;
  availableQuantity(outcome: PredictionOutcome): number;
  estimateFee(
    quantity: number,
    upPrice: number,
    taker: boolean,
  ): number | undefined;
  evaluateOneTapOrder(
    outcome: PredictionOutcome,
    quoteAmount: number,
  ): OneTapOrderEvaluation;
}
export interface TradePanelProps extends TradePanelFormProps {
  isOneTap: boolean;
  visibleOrderError?: PredictionOrderValidationError;
  errorMsgVisible: boolean;
  submitButtonRef: RefObject<HTMLButtonElement>;
  submitDisabled: boolean;
  isBuyContext: boolean;
  canAdjustAmount: boolean;
  availablePositionQuantity: number;
  estimatedFee: number | undefined;
  oneTapEstimatedSlippage: number | null;
  oneTapAmounts: OneTapAmounts;
  oneTapOptions: Record<
    PredictionOutcome,
    { payout: number; blockReason: string | null; disabled: boolean }[]
  >;
  draftOneTapAmounts: Record<PredictionOutcome, string[]>;
  oneTapEditorError: boolean;
  beginOneTapEdit(): void;
  updateOneTapDraft(
    outcome: PredictionOutcome,
    index: number,
    value: string,
  ): void;
  addOneTapRow(): void;
  removeOneTapRow(index: number): void;
  resetOneTapDraft(): void;
  saveOneTapAmounts(): boolean;
}
const toDraft = (amounts: OneTapAmounts) => ({
  up: amounts.up.map(String),
  down: amounts.down.map(String),
});

export function useTradePanelScript(
  input: TradePanelScriptInput,
): TradePanelProps {
  const validationContext = JSON.stringify([
    input.selectedRow?.symbol,
    input.tradeMode,
    input.orderSide,
    input.selectedOutcome,
  ]);
  const [validation, setValidation] = useState({
    context: validationContext,
    validated: false,
    errorMsgVisible: false,
  });
  if (validation.context !== validationContext) {
    setValidation({
      context: validationContext,
      validated: false,
      errorMsgVisible: false,
    });
  }
  const validated =
    validation.context === validationContext && validation.validated;
  const errorMsgVisible = validated && validation.errorMsgVisible;
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!errorMsgVisible) return;

    const handleClick = (event: MouseEvent) => {
      if (
        event.target instanceof Node &&
        submitButtonRef.current?.contains(event.target)
      ) {
        return;
      }
      setValidation((current) => ({ ...current, errorMsgVisible: false }));
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [errorMsgVisible]);
  const submitDisabled =
    !input.orderEntryAccountReady ||
    !input.orderEntryFunded ||
    !input.isRoundTradable ||
    input.isRegionRestricted ||
    input.isSubmitting;
  const [stored, saveStored] = useLocalStorage<OneTapAmounts | number[]>(
    "orderly-prediction-one-tap-amounts",
    DEFAULT_ONE_TAP_AMOUNTS,
  );
  const [draftOneTapAmounts, setDraft] = useState(() =>
    toDraft(DEFAULT_ONE_TAP_AMOUNTS),
  );
  const [oneTapEditorError, setError] = useState(false);
  const oneTapAmounts = alignOneTapAmounts(
    resolveOneTapAmounts(stored, "up"),
    resolveOneTapAmounts(stored, "down"),
  );
  const isOneTap = input.tradeMode === "oneTap";
  const orderEntryAccountReady = input.orderEntryAccountReady ?? false;
  const orderEntryFunded = input.orderEntryFunded ?? false;
  const oneTapOptions: TradePanelProps["oneTapOptions"] = { up: [], down: [] };
  const slippages: number[] = [];
  for (const outcome of ["up", "down"] as const) {
    oneTapOptions[outcome] = oneTapAmounts[outcome].map((amount) => {
      const evaluation = isOneTap
        ? input.evaluateOneTapOrder(outcome, amount)
        : undefined;
      const payout = evaluation?.quantity ?? 0;
      const blockReason = evaluation?.blockReason ?? null;
      const slippage = evaluation?.estimatedSlippage ?? null;
      if (slippage !== null) slippages.push(slippage);
      return {
        payout,
        blockReason,
        disabled:
          !orderEntryAccountReady ||
          !orderEntryFunded ||
          input.isSubmitting ||
          (isOneTap && !evaluation?.canPlace),
      };
    });
  }
  return {
    tradeMode: input.tradeMode,
    setTradeMode: input.setTradeMode,
    orderSide: input.orderSide,
    setOrderSide: input.setOrderSide,
    orderType: input.orderType,
    selectedOutcome: input.selectedOutcome,
    setSelectedOutcome: input.setSelectedOutcome,
    amountUnit: input.amountUnit,
    balance: input.balance,
    maxAmount: input.maxAmount,
    hasMaxAmountEstimate: input.hasMaxAmountEstimate,
    isRoundTradable: input.isRoundTradable,
    isRegionRestricted: input.isRegionRestricted,
    executablePrices: input.executablePrices,
    selectedRow: input.selectedRow,
    isSubmitting: input.isSubmitting,
    placeOneTapOrder: input.placeOneTapOrder,
    limitPrice: input.limitPrice,
    setLimitPrice: input.setLimitPrice,
    amount: input.amount,
    setAmount: input.setAmount,
    totalInput: input.totalInput,
    setTotal: input.setTotal,
    orderQuantity: input.orderQuantity,
    orderNotional: input.orderNotional,
    orderPercentage: input.orderPercentage,
    setOrderPercentage: input.setOrderPercentage,
    odds: input.odds,
    estimatedPayout: input.estimatedPayout,
    canPlaceOrder: input.canPlaceOrder,
    submitDisabled,
    submitButtonRef,
    errorMsgVisible,
    orderValidationError: input.orderValidationError,
    visibleOrderError:
      validated && !input.canPlaceOrder
        ? (input.orderValidationError ?? {
            field: "amount",
            key: "prediction.invalidOrder",
          })
        : undefined,
    placeOrder: () => {
      if (submitDisabled) return;
      setValidation({
        context: validationContext,
        validated: !input.canPlaceOrder,
        errorMsgVisible: !input.canPlaceOrder,
      });
      if (input.canPlaceOrder) input.placeOrder();
    },
    slippage: input.slippage,
    setSlippage: input.setSlippage,
    estimatedSlippage: input.estimatedSlippage,
    feeRates: input.feeRates,
    requiredFrozen: input.requiredFrozen,
    fundingEstimateMode: input.fundingEstimateMode,
    orderEntryAccountReady,
    orderEntryFunded,
    isOneTap,
    isBuyContext: isOneTap || input.orderSide === "buy",
    canAdjustAmount:
      orderEntryAccountReady &&
      orderEntryFunded &&
      input.maxAmount > 0 &&
      (input.orderSide === "sell" || input.hasMaxAmountEstimate) &&
      input.isRoundTradable &&
      !input.isRegionRestricted,
    availablePositionQuantity: input.availableQuantity(input.selectedOutcome),
    estimatedFee: input.estimateFee(
      input.orderQuantity,
      toBinaryUpRequest(input.selectedOutcome, "buy", input.selectedPrice)
        .upPrice,
      input.orderType === "market",
    ),
    oneTapEstimatedSlippage: slippages.length ? Math.max(...slippages) : null,
    oneTapAmounts,
    oneTapOptions,
    draftOneTapAmounts,
    oneTapEditorError,
    beginOneTapEdit: () => {
      setDraft(toDraft(oneTapAmounts));
      setError(false);
    },
    updateOneTapDraft: (outcome, index, value) => {
      setDraft((previous) => ({
        ...previous,
        [outcome]: previous[outcome].map((amount, position) =>
          position === index ? value : amount,
        ),
      }));
      setError(false);
    },
    addOneTapRow: () => {
      setDraft((previous) =>
        previous.up.length < 3
          ? { up: [...previous.up, ""], down: [...previous.down, ""] }
          : previous,
      );
      setError(false);
    },
    removeOneTapRow: (index) => {
      setDraft((previous) =>
        previous.up.length > 1
          ? {
              up: previous.up.filter((_, position) => position !== index),
              down: previous.down.filter((_, position) => position !== index),
            }
          : previous,
      );
      setError(false);
    },
    resetOneTapDraft: () => {
      setDraft(toDraft(DEFAULT_ONE_TAP_AMOUNTS));
      setError(false);
    },
    saveOneTapAmounts: () => {
      const amounts = parseOneTapDraft(draftOneTapAmounts);
      if (!amounts) {
        setError(true);
        return false;
      }
      saveStored(amounts);
      setError(false);
      return true;
    },
  };
}
