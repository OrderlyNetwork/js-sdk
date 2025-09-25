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

  const {
    maxLeverage: originalMaxLeverage,
    update,
    isLoading,
  } = useSymbolLeverage(symbol);

  const maxLeverage = originalMaxLeverage;

  const {
    position,
    maxPositionNotional,
    maxPositionLeverage,
    overMaxPositionLeverage,
    overRequiredMargin,
  } = useCalc({ symbol: symbol!, leverage, maxLeverage });

  const formattedLeverageLevers = useMemo(() => {
    return generateLeverageLeversForSelector(maxLeverage);
  }, [maxLeverage]);

  const leverageLevers = useMemo(() => {
    return generateLeverageLevers(maxLeverage);
  }, [maxLeverage]);

  const marks = useMemo<SliderMarks>(() => {
    return (
      leverageLevers.map((e) => ({
        label: `${e}x`,
        value: e,
      })) || []
    );
  }, [leverageLevers]);

  const step = useMemo(() => {
    return 100 / ((marks?.length || 0) - 1);
  }, [marks]);

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
    leverageLevers,
    currentLeverage: leverage,
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

// 5x: 1x, 2x, 3x, 4x, 5x
// 10x: 1x, 3x, 5x, 8x, 10x
// 20x: 1x, 5x, 10x, 15x, 20x
// 50x: 1x, 10x, 20x, 35x, 50x
// 100x: 1x, 20x, 50x, 75x, 100x
const generateLeverageLeversForSelector = (max: number) => {
  if (max === 10) {
    return [1, 3, 5, 8, 10];
  } else if (max === 50) {
    return [1, 10, 20, 35, 50];
  }

  const min = 1;
  const parts = 5;
  const step = (max - min) / (parts - 1);
  const result: number[] = [];
  for (let i = 0; i < parts; i++) {
    result.push(Math.floor(min + step * i));
  }
  return result;
};
/**
 * 生成均分分布的刻度点
 * @param max 最大杠杆值
 * @returns 均分的刻度点数组
 */
const generateEvenlyDistributedMarks = (max: number): number[] => {
  const result: number[] = [];

  // 检查是否能被5整除
  if (max % 5 === 0) {
    // 能被5整除，从0到max均分成5个区间（6个刻度点），1x代表0
    const step = max / 5;
    for (let i = 0; i < 6; i++) {
      const value = step * i;
      result.push(value === 0 ? 1 : value); // 0显示为1x，其他值正常显示
    }
  } else {
    // 不能被5整除，使用25%、50%、75%策略选择最靠近的整数
    result.push(1); // 总是包含1x

    // 计算25%、50%、75%位置的值
    const quarter = max * 0.25;
    const half = max * 0.5;
    const threeQuarter = max * 0.75;

    // 选择最靠近的整数
    const quarterRounded = Math.round(quarter);
    const halfRounded = Math.round(half);
    const threeQuarterRounded = Math.round(threeQuarter);

    // 添加25%位置的值（如果大于1且不等于50%）
    if (quarterRounded > 1 && quarterRounded !== halfRounded) {
      result.push(quarterRounded);
    }

    // 添加50%位置的值（如果大于1）
    if (halfRounded > 1) {
      result.push(halfRounded);
    }

    // 添加75%位置的值（如果大于50%且小于max）
    if (threeQuarterRounded > halfRounded && threeQuarterRounded < max) {
      result.push(threeQuarterRounded);
    }

    // 添加最大值（如果大于1）
    if (max > 1) {
      result.push(max);
    }
  }

  return result;
};

// 5x: 1, 2, 3, 4, 5
// 10x: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
// 20x: 1, 5, 10, 15, 20
// 50x: 1, 10, 20, 30, 40, 50
// 100x: 1, 20, 40, 60, 80, 100
const generateLeverageLevers = (max: number) => {
  switch (max) {
    case 10:
      return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    case 20:
      return [1, 5, 10, 15, 20];
    case 50:
      return [1, 10, 20, 30, 40, 50];
    case 100:
      return [1, 20, 40, 60, 80, 100];
  }

  // 兜底策略：均分刻度点距离，1x当成0处理
  const result: number[] = [];
  //优化
  if (max < 10) {
    // 对于10x及以下，均分成n等分，每份长度是1
    for (let i = 1; i <= max; i++) {
      result.push(i);
    }
  } else {
    // 使用统一的均分策略
    result.push(...generateEvenlyDistributedMarks(max));
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
      // not used
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
