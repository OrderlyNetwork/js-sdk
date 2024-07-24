import {
  useDebounce,
  useDebouncedCallback,
  useLeverage,
  useMarginRatio,
} from "@orderly.network/hooks";
import { SliderMarks } from "@orderly.network/ui";
import { log } from "console";
import { useMemo, useState } from "react";

export type LeverageScriptReturns = {
  currentLeverage?: number;
  value: number;
  marks?: SliderMarks;
  onLeverageChange: (leverage: number) => void;
  step: number;
};

export const useLeverageScript = (): LeverageScriptReturns => {
  const { currentLeverage } = useMarginRatio();

  const [maxLeverage, { update, config: leverageLevers, isMutating }] =
    useLeverage();
  const onLeverageChange = (leverage: number) => {
    setLeverage(leverage);
    updateLeverage(leverage);
  };

  const updateLeverage = useDebouncedCallback((leverage: number) => {
    update({ leverage });
  }, 200);

  const [leverage, setLeverage] = useState(maxLeverage ?? 0);

  
  const marks = useMemo((): SliderMarks => {
    return leverageLevers?.map((e: number) => ({
      label: `${e}x`,
      value: e,
    })) || [];
  }, [leverageLevers]);
  
  const step = 100 / ((marks?.length || 0) - 1);
  
  const leverageValue = useMemo(() => {
    const index = leverageLevers.findIndex((item: any) => item === leverage);

    return index * step;
  }, [leverageLevers, leverage, step]);
  console.log("leverage", leverageValue);
  

  return {
    currentLeverage,
    value: leverageValue,
    marks,
    onLeverageChange,
    step,
  };
};

export type UseLeverageScript = ReturnType<typeof useLeverageScript>;
