import { useLeverage, useMarginRatio } from "@orderly.network/hooks";
import { SliderMarks, toast } from "@orderly.network/ui";
import { useMemo, useState } from "react";

type UseLeverageScriptOptions = {
  close?: () => void;
};

export type LeverageScriptReturns = ReturnType<typeof useLeverageScript>;

export const useLeverageScript = (options?: UseLeverageScriptOptions) => {
  const { currentLeverage } = useMarginRatio();
  const [showSliderTip, setShowSliderTip] = useState(false);

  const [curLeverage, { update, config: leverageLevers, isMutating }] =
    useLeverage();

  const marks = useMemo((): SliderMarks => {
    return (
      leverageLevers?.map((e: number) => ({
        label: `${e}x`,
        value: e,
      })) || []
    );
  }, [leverageLevers]);

  const [leverage, setLeverage] = useState(curLeverage ?? 0);

  const maxLeverage = leverageLevers?.reduce(
    (a: number, item: any) => Math.max(a, Number(item), 0),
    0
  );

  const step = 100 / ((marks?.length || 0) - 1);

  // const leverageValue = useMemo(() => {
  //   const index = leverageLevers.findIndex((item: any) => item === leverage);

  //   return index * step;
  // }, [leverageLevers, leverage, step]);

  const onLeverageChange = (leverage: number) => {
    // maxLeverage / 100 * leverage;
    setLeverage(leverage);
    // updateLeverage(leverage);
  };

  const onSave = async () => {
    try {
      update({ leverage }).then(
        (res: any) => {
          options?.close?.();
          toast.success("Leverage updated");
        },
        (err: Error) => {
          toast.error(err.message);
        }
      );
    } catch (e) {}
  };

  return {
    currentLeverage,
    value: leverage,
    marks,
    onLeverageChange,
    step,
    onCancel: options?.close,
    onSave,
    isLoading: isMutating,
    showSliderTip,
    setShowSliderTip,
    maxLeverage,
  };
};
