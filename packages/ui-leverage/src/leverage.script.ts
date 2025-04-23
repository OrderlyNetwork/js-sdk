import { useMemo, useState } from "react";
import { useLeverage, useMarginRatio } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { SliderMarks, toast } from "@orderly.network/ui";

type UseLeverageScriptOptions = {
  close?: () => void;
};

export type LeverageScriptReturns = ReturnType<typeof useLeverageScript>;

export const useLeverageScript = (options?: UseLeverageScriptOptions) => {
  const { currentLeverage } = useMarginRatio();
  const [showSliderTip, setShowSliderTip] = useState(false);
  const { t } = useTranslation();
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

  const [leverage, setLeverage] = useState<number>(curLeverage ?? 0);

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

  const onLeverageIncrease: React.MouseEventHandler<SVGSVGElement> = () => {
    setLeverage((prev) => prev + 1);
  };

  const onLeverageReduce: React.MouseEventHandler<SVGSVGElement> = () => {
    setLeverage((prev) => prev - 1);
  };

  const onSave = async () => {
    try {
      update({ leverage }).then(
        (res: any) => {
          options?.close?.();
          toast.success(t("leverage.updated"));
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
    onLeverageIncrease,
    onLeverageReduce,
    isReduceDisabled: leverage <= 1,
    isIncreaseDisabled: leverage >= 50,
    step,
    onCancel: options?.close,
    onSave,
    isLoading: isMutating,
    showSliderTip,
    setShowSliderTip,
    maxLeverage,
  };
};
