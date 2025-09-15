import { useCallback, useMemo, useState } from "react";
import {
  useAccountInfo,
  useLocalStorage,
  useMarkPricesStream,
  usePortfolio,
  usePositionStream,
  useSymbolLeverage,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  account as accountPerp,
  positions as positionsPerp,
} from "@orderly.network/perp";
import { OrderSide } from "@orderly.network/types";
import {
  modal,
  SliderMarks,
  toast,
  useScreen,
  Text,
} from "@orderly.network/ui";
import { zero } from "@orderly.network/utils";

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
  const [leverage, setLeverage] = useState<number>(curLeverage);

  const { t } = useTranslation();

  const { isMobile } = useScreen();

  const { maxLeverage, update, isLoading } = useSymbolLeverage(symbol);

  const {
    position,
    maxPositionNotional,
    maxPositionLeverage,
    overMaxPositionLeverage,
    overRequiredMargin,
  } = useCalc({ symbol: symbol!, leverage, maxLeverage });

  const formattedLeverageLevers = generateLeverageLevers(maxLeverage);

  const marks = useMemo<SliderMarks>(() => {
    return (
      formattedLeverageLevers.map((e) => ({
        label: `${e}x`,
        value: e,
      })) || []
    );
  }, [formattedLeverageLevers]);

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

  const onSave = async () => {
    modal.confirm({
      title: t("leverage.confirm"),
      content: <Text intensity={54}>{t("leverage.confirm.content")}</Text>,
      onOk: onConfirmSave,
      onCancel: () => {
        return Promise.resolve();
      },
    });
  };

  const isReduceDisabled = leverage <= 1;
  const isIncreaseDisabled = leverage >= maxLeverage;

  const isBuy = side
    ? side === OrderSide.BUY
    : position?.position_qty && position.position_qty > 0;

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

function useCalc(inputs: {
  symbol: string;
  leverage: number;
  maxLeverage: number;
}) {
  const { symbol, leverage, maxLeverage } = inputs;

  const symbolsInfo = useSymbolsInfo();
  const { data: accountInfo } = useAccountInfo();
  const { data: markPrices } = useMarkPricesStream();
  const { totalCollateral } = usePortfolio();

  const [unPnlPriceBasis, setUnPnlPriceBasic] = useLocalStorage(
    "unPnlPriceBasis",
    "markPrice",
  );
  const [positions] = usePositionStream("all", {
    calcMode: unPnlPriceBasis,
  });

  const position = useMemo(() => {
    if (symbol && positions?.rows?.length) {
      return positions.rows.find((item) => item.symbol === symbol);
    }
  }, [positions, symbol]);

  /** the highest allowable leverage. Block users from setting leverage above this limit. */
  const maxPositionLeverage = useMemo(() => {
    const IMRFactor = accountInfo?.imr_factor?.[symbol];
    const notional = position?.notional;
    // when user has existing position
    if (IMRFactor && notional) {
      const maxPositionLeverage = positionsPerp.maxPositionLeverage({
        IMRFactor,
        notional,
      });
      return Math.min(maxPositionLeverage, maxLeverage);
    }

    // when user has no existing position
    return maxLeverage;
  }, [position, maxLeverage, symbol]);

  /** calculate maximum position at current leverage */
  const maxPositionNotional = useMemo(() => {
    const IMRFactor = accountInfo?.imr_factor?.[symbol];
    if (leverage && IMRFactor) {
      return positionsPerp.maxPositionNotional({
        leverage,
        IMRFactor,
      });
    }
  }, [leverage, symbol]);

  const overMaxPositionLeverage = useMemo(() => {
    return leverage > maxPositionLeverage;
  }, [leverage, maxPositionLeverage]);

  // calc free collateral with new leverage
  const freeCollateral = useMemo(() => {
    if (!accountInfo || !markPrices || !symbolsInfo) {
      return zero;
    }

    const positionList = leverage
      ? positions?.rows.map((item) => {
          if (item.symbol === symbol) {
            return {
              ...item,
              leverage,
            };
          }
          return item;
        })
      : positions?.rows;

    const totalInitialMarginWithOrders = accountPerp.totalInitialMarginWithQty({
      positions: positionList,
      markPrices,
      IMR_Factors: accountInfo.imr_factor,
      maxLeverage: accountInfo.max_leverage,
      symbolInfo: symbolsInfo,
    });

    const freeCollateral = accountPerp.freeCollateral({
      totalCollateral,
      totalInitialMarginWithOrders,
    });

    return freeCollateral;
  }, [
    positions,
    symbolsInfo,
    accountInfo,
    markPrices,
    totalCollateral,
    leverage,
    symbol,
  ]);

  const overRequiredMargin = useMemo(() => {
    return freeCollateral.eq(0) || freeCollateral.isNegative();
  }, [freeCollateral]);

  return {
    position,
    freeCollateral,
    maxPositionNotional,
    maxPositionLeverage,
    overMaxPositionLeverage,
    overRequiredMargin,
  };
}
