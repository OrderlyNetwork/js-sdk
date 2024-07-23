import { useDebounce, useDebouncedCallback, useLeverage, useMarginRatio } from "@orderly.network/hooks";
import { SliderMarks } from "@orderly.network/ui";
import { useMemo, useState } from "react";

export type LeverageScriptReturns = {
  currentLeverage?: number;
  initialValue?: number;
  marks?: SliderMarks;
  onLeverageChange: (leverage: number) => void;
};

export const useLeverageScript = (): LeverageScriptReturns => {
  const { currentLeverage } = useMarginRatio();

  const [maxLeverage, { update, config: leverageLevers, isMutating }] =
    useLeverage();
  const onLeverageChange = useDebouncedCallback((leverage: number) => {
    update({leverage});
  }, 200);

  const leverageValue = useMemo(() => {
    const leverage = maxLeverage ?? 0;
    const index = leverageLevers.findIndex((item: any) => item === leverage);

    return index;
  }, [leverageLevers]);

  const marks = useMemo(() => {
    return leverageLevers.map((e: number) => ({
      label: `${e}x`,
      value: e,
    }));
  }, [leverageLevers]);

  return {
    currentLeverage,
    initialValue: leverageValue,
    marks,
    onLeverageChange,
  };
};

export type UseLeverageScript = ReturnType<typeof useLeverageScript>;
