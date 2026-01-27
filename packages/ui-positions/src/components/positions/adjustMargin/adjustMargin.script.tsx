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
  liquidationPrice: number;
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
  const [sliderValue, setSliderValue] = useState(0);

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

  const syncSliderFromInput = useCallback(
    (value: string) => {
      if (!value) {
        setSliderValue(0);
        return;
      }
      if (!maxAmount) return;
      const val = new Decimal(value);
      if (maxAmount === 0) {
        setSliderValue(0);
        return;
      }
      const percent = val.div(maxAmount).mul(100).toNumber();
      setSliderValue(Math.min(100, Math.max(0, percent)));
    },
    [maxAmount],
  );

  const syncInputFromSlider = useCallback(
    (value: number) => {
      if (!maxAmount) return;
      const val = new Decimal(maxAmount).mul(value).div(100);
      setInputValue(val.toFixed(2, Decimal.ROUND_DOWN));
    },
    [maxAmount],
  );

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
      syncSliderFromInput(finalValue);
    },
    [syncSliderFromInput, maxAmount],
  );

  const onSliderChange = useCallback(
    (value: number) => {
      setSliderValue(value);
      syncInputFromSlider(value);
    },
    [syncInputFromSlider],
  );

  const onTabChange = useCallback((nextTab: AdjustMarginTab) => {
    setTab(nextTab);
    setInputValue("");
    setSliderValue(0);
  }, []);

  const canConfirm = useMemo(() => {
    if (!inputValue) return false;
    const value = new Decimal(inputValue);
    return !value.isZero() && value.isPositive();
  }, [inputValue]);

  const onConfirm = useCallback(async () => {
    if (!inputValue || new Decimal(inputValue).isZero()) return;

    // Validate if input value exceeds maxAmount
    if (maxAmount) {
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
      await updateMargin(payload);
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
    liquidationPrice: liquidationPrice ?? 0,
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
