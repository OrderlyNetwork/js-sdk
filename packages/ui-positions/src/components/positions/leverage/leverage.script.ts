import { useCallback, useMemo, useState } from "react";
import { useSymbolLeverages } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { SliderMarks, toast } from "@orderly.network/ui";

type UseLeverageScriptOptions = {
  close?: () => void;
};

export type SymbolLeverageScriptOptions = {
  leverageLevers?: number[];
  curLeverage: number;
  symbol: string;
  positionQty?: number;
};

const DEFAULT_LEVERAGE_LEVERS = [5, 10, 20, 50, 100];

export type SymbolLeverageScriptReturns = ReturnType<
  typeof useSymbolLeverageScript
>;

export const useSymbolLeverageScript = (
  options?: SymbolLeverageScriptOptions & UseLeverageScriptOptions,
) => {
  const {
    curLeverage = 1,
    leverageLevers = DEFAULT_LEVERAGE_LEVERS,
    symbol,
  } = options || {};
  const [showSliderTip, setShowSliderTip] = useState(false);
  const { t } = useTranslation();
  const { maxSymbolLeverage, update, isLoading } = useSymbolLeverages(
    symbol || "",
  );

  const filteredLeverageLevers = useMemo(() => {
    return leverageLevers.filter((e) => e <= maxSymbolLeverage);
  }, [leverageLevers, maxSymbolLeverage]);

  const marks = useMemo<SliderMarks>(() => {
    return (
      filteredLeverageLevers.map((e) => ({
        label: `${e}x`,
        value: e,
      })) || []
    );
  }, [filteredLeverageLevers]);

  const [leverage, setLeverage] = useState<number>(curLeverage ?? 0);

  const step = 100 / ((marks?.length || 0) - 1);

  const onLeverageChange = (leverage: number) => {
    setLeverage(leverage);
  };

  const onLeverageIncrease: React.MouseEventHandler<SVGSVGElement> = () => {
    setLeverage((prev) => prev + 1);
  };

  const onLeverageReduce: React.MouseEventHandler<SVGSVGElement> = () => {
    setLeverage((prev) => prev - 1);
  };

  const onInputChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const parsed = Number.parseInt(e.target.value);
      const value = Number.isNaN(parsed) ? "" : parsed;
      setLeverage(value as number);
    },
    [maxSymbolLeverage],
  );

  const onSave = async () => {
    try {
      update?.({ leverage, symbol }).then(
        () => {
          options?.close?.();
          toast.success(t("leverage.updated"));
        },
        (err: Error) => {
          toast.error(err.message);
        },
      );
    } catch (err) {
      console.log("update leverage error", err);
    }
  };

  const isReduceDisabled = leverage <= 1;
  const isIncreaseDisabled = leverage >= maxSymbolLeverage;
  const disabled = !leverage || leverage < 1 || leverage > maxSymbolLeverage;

  return {
    leverageLevers: filteredLeverageLevers,
    currentLeverage: curLeverage,
    value: leverage,
    marks,
    onLeverageChange,
    onLeverageIncrease,
    onLeverageReduce,
    onInputChange,
    isReduceDisabled,
    isIncreaseDisabled,
    disabled,
    step,
    onCancel: options?.close,
    onSave,
    isLoading: isLoading,
    showSliderTip,
    setShowSliderTip,
    maxLeverage: maxSymbolLeverage,
    toggles: filteredLeverageLevers,
    symbol,
  };
};
