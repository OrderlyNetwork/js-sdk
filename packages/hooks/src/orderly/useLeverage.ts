import { useCallback, useMemo } from "react";
import { useMutation } from "../useMutation";
import { usePrivateQuery } from "../usePrivateQuery";
import { useQuery } from "../useQuery";

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

export const useLeverage = () => {
  const { data, mutate } = usePrivateQuery<{ max_leverage: string | number }>(
    "/v1/client/info",
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
    return generateLeverageLevers(memoizedMaxLeverage);
  }, [memoizedMaxLeverage]);

  return {
    update: updateLeverage,
    isLoading: isLoading || isMutating,
    leverageLevers: memoizedLeverageLevers,
    curLeverage: memoizedCurLeverage,
    maxLeverage: memoizedMaxLeverage,
  } as const;
};
