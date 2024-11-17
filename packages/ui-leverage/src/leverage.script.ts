import {
  useDebounce,
  useDebouncedCallback,
  useLeverage,
  useMarginRatio,
} from "@orderly.network/hooks";
import { SliderMarks, toast, useModal } from "@orderly.network/ui";
import { log } from "console";
import { useMemo, useState } from "react";

export const useLeverageScript = () => {
  const { hide } = useModal();

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

  const maxLeverage = leverageLevers?.reduce((a: number, item: any) =>
    Math.max(a, Number(item), 0)
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

  const onCancel = () => hide();
  const onSave = async () => {
    try {
      update({ leverage }).then(
        (res: any) => {
          hide();
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
    onCancel,
    onSave,
    isLoading: isMutating,
    showSliderTip,
    setShowSliderTip,
    maxLeverage,
  };
};

export type LeverageScriptReturns = ReturnType<typeof useLeverageScript>;
