import { useCallback } from "react";
import { prop } from "ramda";
import { useMutation } from "../useMutation";
import { usePrivateQuery } from "../usePrivateQuery";
import { useQuery } from "../useQuery";

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
export const useLeverage = (): [
  number | undefined,
  {
    /** Function to update leverage */
    update: (data: { leverage: number }) => Promise<any>;
    /** Boolean indicating if an update is in progress */
    isMutating: boolean;
    /** Array of available leverage options */
    config: number[];
  },
] => {
  const { data, mutate } = usePrivateQuery("/v1/client/info", {
    revalidateOnFocus: false,
  });
  const [update, { isMutating }] = useMutation("/v1/client/leverage");

  const { data: config } = useQuery("/v1/public/config", {
    revalidateOnFocus: false,
  });

  const updateLeverage = useCallback((data: { leverage: number }) => {
    return update(data).then((res: any) => {
      if (res.success) {
        return mutate();
      } else {
        throw new Error(res.message);
      }
      // return res
    });
  }, []);

  return [
    prop("max_leverage", data as any),
    {
      update: updateLeverage,
      isMutating,
      config: config
        ? (config as any)?.available_futures_leverage
            ?.split(",")
            .map((item: string) => parseInt(item))
        : [],
    },
  ];
};
