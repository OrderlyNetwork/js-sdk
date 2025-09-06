import { useCallback, useMemo, useState } from "react";
import {
  useLocalStorage,
  usePositionStream,
  useSymbolLeverage,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { positions } from "@orderly.network/perp";
import { OrderSide } from "@orderly.network/types";
import {
  Checkbox,
  modal,
  SliderMarks,
  toast,
  Text,
  useScreen,
} from "@orderly.network/ui";

type UseLeverageScriptOptions = {
  close?: () => void;
};

export type SymbolLeverageScriptOptions = {
  symbol: string;
  side?: OrderSide;
  curLeverage: number;
};

export type SymbolLeverageScriptReturns = ReturnType<
  typeof useSymbolLeverageScript
>;

export const useSymbolLeverageScript = (
  options: SymbolLeverageScriptOptions & UseLeverageScriptOptions,
) => {
  const { curLeverage = 1, symbol, side } = options;
  const [showSliderTip, setShowSliderTip] = useState(false);
  const { t } = useTranslation();
  const position = usePositionBySymbol(symbol!);
  const { notional, position_qty, mm: currentMargin } = position || {};
  const { isMobile } = useScreen();

  const { maxLeverage, update, isLoading, symbolInfo } =
    useSymbolLeverage(symbol);

  const formattedLeverageLevers = generateLeverageLevers(maxLeverage);

  const marks = useMemo<SliderMarks>(() => {
    return (
      formattedLeverageLevers.map((e) => ({
        label: `${e}x`,
        value: e,
      })) || []
    );
  }, [formattedLeverageLevers]);

  const [leverage, setLeverage] = useState<number>(curLeverage);

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
    [maxLeverage],
  );

  const onConfirmSave = async () => {
    try {
      update?.({ leverage, symbol }).then(
        (res) => {
          if (res.success) {
            options?.close?.();
            toast.success(t("leverage.updated"));
          } else {
            toast.error(res.message);
          }
        },
        (err: Error) => {
          toast.error(err.message);
        },
      );
    } catch (err) {
      console.log("update leverage error", err);
    }
  };

  const onCheckedChange = (checked: boolean) => {
    localStorage.setItem(
      "symbol_leverage_disable_confirmation",
      checked ? "true" : "false",
    );
  };

  const onSave = async () => {
    const localDisableConfirmation = localStorage.getItem(
      "symbol_leverage_disable_confirmation",
    );
    if (localDisableConfirmation === "true") {
      return onConfirmSave();
    }

    modal.confirm({
      title: t("leverage.confirm"),
      classNames: {
        body: "!oui-pb-0",
      },
      content: (
        <div>
          {t("leverage.confirm.content")}
          <div className="oui-mt-8 oui-flex oui-items-center oui-gap-1">
            <Checkbox
              className="oui-border-base-contrast-80"
              onCheckedChange={onCheckedChange}
            />
            <Text size="xs" intensity={54}>
              {t("leverage.confirm.disable.confirmation")}
            </Text>
          </div>
        </div>
      ),
      onOk: () => {
        return onConfirmSave();
      },
      onCancel: () => {
        localStorage.setItem("symbol_leverage_disable_confirmation", "false");
        return Promise.resolve();
      },
    });
  };

  const isReduceDisabled = leverage <= 1;
  const isIncreaseDisabled = leverage >= maxLeverage;

  /** the highest allowable leverage. Block users from setting leverage above this limit. */
  const maxPositionLeverage = useMemo(() => {
    const IMRFactor = symbolInfo?.("imr_factor");
    if (notional && IMRFactor) {
      return positions.maxPositionLeverage({
        IMRFactor,
        notional,
      });
    }

    return 1;
  }, [leverage, symbolInfo, notional]);

  /** calculate maximum position at current leverage */
  const maxPositionNotional = useMemo(() => {
    const IMRFactor = symbolInfo?.("imr_factor");
    if (leverage && IMRFactor) {
      return positions.maxPositionNotional({
        leverage,
        IMRFactor,
      });
    }
  }, [leverage, symbolInfo]);

  const requiredMargin = useMemo(() => {
    if (maxPositionNotional && leverage) {
      return positions.requiredMargin({
        maxNotional: maxPositionNotional,
        leverage,
      });
    }
  }, [maxPositionNotional, leverage]);

  const overMaxPositionLeverage = useMemo(() => {
    return leverage > maxPositionLeverage;
  }, [leverage, maxPositionLeverage]);

  /**
   * If current_margin < required_margin, disable confirm button and display error message:
   * Margin is not enough. Please try adjusting to another leverage level.
   */
  const overRequiredMargin = useMemo(() => {
    // if (currentMargin && currentMargin < requiredMargin) {
    //   return true;
    // }
    return false;
  }, [requiredMargin, currentMargin]);

  const isBuy = side
    ? side === OrderSide.BUY
    : position_qty && position_qty > 0;

  const disabled =
    !leverage ||
    leverage < 1 ||
    leverage > maxLeverage ||
    overRequiredMargin ||
    overMaxPositionLeverage;

  return {
    leverageLevers: formattedLeverageLevers,
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
    isLoading,
    showSliderTip,
    setShowSliderTip,
    maxLeverage,
    toggles: formattedLeverageLevers,
    symbol,
    maxPositionNotional,
    maxPositionLeverage,
    requiredMargin,
    overMaxPositionLeverage,
    overRequiredMargin,
    isBuy,
    isMobile,
  };
};

const generateLeverageLevers = (max: number) => {
  const min = 1;
  const parts = 5;
  const step = (max - min) / (parts - 1);
  const result: number[] = [];
  for (let i = 0; i < parts; i++) {
    result.push(Math.floor(min + step * i));
  }
  return result;
};

function usePositionBySymbol(symbol: string) {
  const [unPnlPriceBasis, setUnPnlPriceBasic] = useLocalStorage(
    "unPnlPriceBasis",
    "markPrice",
  );
  const [data] = usePositionStream(symbol, {
    calcMode: unPnlPriceBasis,
  });

  return useMemo(() => {
    if (symbol && data?.rows?.length) {
      return data.rows.find((item) => item.symbol === symbol);
    }
  }, [data, symbol]);
}
