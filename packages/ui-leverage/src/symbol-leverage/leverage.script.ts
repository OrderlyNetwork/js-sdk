import { useCallback, useMemo, useState } from "react";
import {
  useMarkPriceBySymbol,
  useSymbolLeverages,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { positions } from "@orderly.network/perp";
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
    positionQty,
  } = options || {};
  const [showSliderTip, setShowSliderTip] = useState(false);
  const { t } = useTranslation();
  const markPrice = useMarkPriceBySymbol(symbol!);

  const { maxSymbolLeverage, update, isLoading, symbolInfo } =
    useSymbolLeverages(symbol || "");

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

  /** the highest allowable leverage. Block users from setting leverage above this limit. */
  const maxPositionLeverage = useMemo(() => {
    if (positionQty && markPrice) {
      const notional = positions.notional(positionQty, markPrice);
      const imr_factor = symbolInfo("imr_factor");
      return positions.maxPositionLeverage({
        IMRFactor: imr_factor,
        notional,
      });
    }

    return 1;
  }, [leverage, symbolInfo, positionQty, markPrice]);

  /** calculate maximum position at current leverage */
  const maxPositionNotional = useMemo(() => {
    return positions.maxPositionNotional({
      leverage,
      IMRFactor: symbolInfo("imr_factor"),
    });
  }, [leverage, symbolInfo]);

  const requiredMargin = useMemo(() => {
    return positions.requiredMargin({
      maxNotional: maxPositionNotional,
      leverage,
    });
  }, [maxPositionNotional, leverage]);

  const overMaxPositionLeverage = useMemo(() => {
    return leverage > maxPositionLeverage;
  }, [leverage, maxPositionLeverage]);

  // todo: add required margin check
  const overRequiredMargin = useMemo(() => {
    return false;
  }, [requiredMargin]);

  const disabled =
    !leverage ||
    leverage < 1 ||
    leverage > maxSymbolLeverage ||
    overRequiredMargin ||
    overMaxPositionLeverage;

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
    maxPositionNotional,
    maxPositionLeverage,
    requiredMargin,
    overMaxPositionLeverage,
    overRequiredMargin,
  };
};
