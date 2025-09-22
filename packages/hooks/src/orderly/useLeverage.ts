import { useCallback, useMemo } from "react";
import { useMutation } from "../useMutation";
import { usePrivateQuery } from "../usePrivateQuery";
import { useQuery } from "../useQuery";

// 5x: 1, 2, 3, 4, 5
// 10x: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10
// 20x: 1, 5, 10, 15, 20
// 50x: 1, 10, 20, 30, 40, 50
// 100x: 1, 20, 40, 60, 80, 100
const generateLeverageLevers = (max: number) => {
  if (max === 10) {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  } else if (max === 20) {
    return [1, 5, 10, 15, 20];
  } else if (max === 50) {
    return [1, 10, 20, 30, 40, 50];
  } else if (max === 100) {
    return [1, 20, 40, 60, 80, 100];
  }

  // 兜底策略：均分刻度点距离，1x当成0处理
  const result: number[] = [];

  if (max <= 10) {
    // 对于10x及以下，使用均分逻辑
    const step = max / 5;
    for (let i = 0; i < 6; i++) {
      const value = step * i;
      // UI显示时，只有0显示为1，其他值保持不变
      const displayValue = value === 0 ? 1 : value;
      // 避免重复值
      if (!result.includes(displayValue)) {
        result.push(displayValue);
      }
    }
  } else {
    // 均分成5个区间（6个刻度点）
    // 1x就是0，从0到max，总共max个单位
    const step = max / 5;
    for (let i = 0; i < 6; i++) {
      const value = step * i;
      // UI显示时，只有0显示为1，其他值保持不变
      result.push(value === 0 ? 1 : value);
    }
  }

  return result;
};

/**
 * A hook for managing leverage in trading.
 *
 * @remarks
 * This hook provides functionality to get and update the user's leverage settings.
 *
 * It fetches the current leverage from client info and available leverage options from config.
 *
 * @returns A tuple containing:
 * - The current maximum leverage value
 * - An object with:
 *   - `update`: Function to update leverage
 *   - `isMutating`: Boolean indicating if an update is in progress
 *   - `config`: Array of available leverage options (e.g. [1, 2, 3, 4, 5, 10, 15, 20])
 *
 * @example
 * ```typescript
 * const [maxLeverage, { update, isMutating, config }] = useLeverage();
 *
 * // Get current max leverage
 * console.log(maxLeverage);
 *
 * // Update leverage
 * update({ leverage: 5 });
 *
 * // Available leverage options
 * console.log(config); // e.g., [1, 2, 3, 4, 5, 10, 15, 20]
 * ```
 */
export const useLeverage = () => {
  const { data, mutate } = usePrivateQuery<{ max_leverage: string | number }>(
    "/v1/client/info",
    {
      revalidateOnFocus: false,
    },
  );

  const [update, { isMutating }] = useMutation("/v1/client/leverage");

  const { data: leverageConfig, isLoading } = useQuery<{
    max_futures_leverage: string;
  }>("/v1/public/leverage", {
    revalidateOnFocus: false,
    errorRetryCount: 3,
    // formatter: (data) => data,
  });

  const updateLeverage = useCallback(
    async (data: { leverage: number }) => {
      const res = await update(data);
      if (res.success) {
        return mutate();
      } else {
        throw new Error(res.message);
      }
    },
    [update, mutate],
  );

  const memoizedCurLeverage = useMemo<number>(() => {
    if (data?.max_leverage !== undefined) {
      return Number(data.max_leverage);
    }
    return 1;
  }, [data?.max_leverage]);

  const memoizedMaxLeverage = useMemo<number>(() => {
    if (leverageConfig?.max_futures_leverage !== undefined) {
      return Number(leverageConfig.max_futures_leverage);
    }
    return 1;
  }, [leverageConfig?.max_futures_leverage]);

  const memoizedLeverageLevers = useMemo<number[]>(() => {
    return generateLeverageLevers(memoizedCurLeverage);
  }, [memoizedCurLeverage]);

  return {
    update: updateLeverage,
    isLoading: isLoading || isMutating,
    leverageLevers: memoizedLeverageLevers,
    curLeverage: memoizedCurLeverage,
    maxLeverage: memoizedMaxLeverage,
  } as const;
};
