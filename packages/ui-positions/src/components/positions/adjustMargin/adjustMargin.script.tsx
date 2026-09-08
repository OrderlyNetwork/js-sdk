import { useCallback, useMemo, useState } from "react";
import { useMutation } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import usePositionMargin from "./hooks/usePositionMargin";

export type AdjustMarginTab = "add" | "reduce";

export interface AdjustMarginScriptProps {
  position: API.PositionTPSLExt;
  symbol: string;
  close: () => void;
}

export interface AdjustMarginState {
  symbol: string;
  tab: AdjustMarginTab;
  inputValue: string;
  sliderValue: number;
  maxAmount: number;
  currentMargin: number;
  liquidationPrice: number | null;
  effectiveLeverage: number;
  isLoading: boolean;
  isAdd: boolean;
  canConfirm: boolean;
  onTabChange: (tab: AdjustMarginTab) => void;
  onInputChange: (value: string) => void;
  onSliderChange: (value: number) => void;
  onConfirm: () => Promise<void>;
  close: () => void;
}

export const useAdjustMarginScript = (
  props: AdjustMarginScriptProps,
): AdjustMarginState => {
  const { position, symbol, close } = props;
  const { t } = useTranslation();

  const [tab, setTab] = useState<AdjustMarginTab>("add");
  const [inputValue, setInputValue] = useState("");

  const [updateMargin, { isMutating: isLoading }] = useMutation(
    "/v1/position_margin",
    "POST",
  );

  const isAdd = useMemo(() => {
    return tab === "add";
  }, [tab]);

  const currentMargin = position.margin ?? 0;

  const finalMargin = useMemo(() => {
    const delta = new Decimal(inputValue || 0);
    if (tab === "add") return currentMargin + delta.toNumber();
    return currentMargin - delta.toNumber();
  }, [currentMargin, inputValue, tab]);

  const { maxAmount, liquidationPrice, effectiveLeverage } = usePositionMargin(
    symbol,
    isAdd,
    currentMargin,
    finalMargin,
  );

  const sliderValue = useMemo(() => {
    if (!inputValue || !maxAmount) return 0;

    const percent = new Decimal(inputValue).div(maxAmount).mul(100).toNumber();
    return Math.min(100, Math.max(0, percent));
  }, [inputValue, maxAmount]);

  const onInputChange = useCallback(
    (value: string) => {
      let finalValue = value;

      // If maxAmount exists, limit input value to not exceed maxAmount
      if (maxAmount && value) {
        const inputDecimal = new Decimal(value);
        if (inputDecimal.gt(maxAmount)) {
          finalValue = new Decimal(maxAmount).toFixed(2, Decimal.ROUND_DOWN);
        }
      }

      setInputValue(finalValue);
    },
    [maxAmount],
  );

  const onSliderChange = useCallback(
    (value: number) => {
      if (!maxAmount) return;
      const nextValue = new Decimal(maxAmount).mul(value).div(100);
      setInputValue(nextValue.toFixed(2, Decimal.ROUND_DOWN));
    },
    [maxAmount],
  );

  const onTabChange = useCallback((nextTab: AdjustMarginTab) => {
    setTab(nextTab);
    setInputValue("");
  }, []);

  const canConfirm = useMemo(() => {
    if (!inputValue || maxAmount === null) return false;
    const value = new Decimal(inputValue);
    return !value.isZero() && value.isPositive();
  }, [inputValue, maxAmount]);

  const onConfirm = useCallback(async () => {
    if (!inputValue || new Decimal(inputValue).isZero()) return;

    // Validate if input value exceeds maxAmount
    if (maxAmount !== null) {
      const inputDecimal = new Decimal(inputValue);
      if (inputDecimal.gt(maxAmount)) {
        toast.error(t("positions.adjustMargin.marginCannotMoreThanMax"));
        return;
      }
    }

    try {
      const payload = {
        symbol,
        amount: new Decimal(inputValue).toString(),
        type: tab === "add" ? "ADD" : "REDUCE",
      };
      const response = await updateMargin(payload);

      if (!response?.success) {
        toast.error(response?.message || t("positions.adjustMargin.failed"));
        return;
      }

      toast.success(t("positions.adjustMargin.success"));
      close();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(message || t("positions.adjustMargin.failed"));
    }
  }, [close, inputValue, symbol, t, tab, updateMargin, maxAmount]);

  return {
    symbol,
    tab,
    inputValue,
    sliderValue,
    maxAmount: maxAmount ?? 0,
    currentMargin: currentMargin,
    liquidationPrice,
    effectiveLeverage: effectiveLeverage ?? 0,
    isLoading,
    isAdd,
    canConfirm,
    onTabChange,
    onInputChange,
    onSliderChange,
    onConfirm,
    close,
  };
};
