import { useCallback } from "react";
import { useMutation } from "../useMutation";
import { usePrivateQuery } from "../usePrivateQuery";
import { prop } from "ramda";
import { useQuery } from "../useQuery";

export const useLeverage = (): any => {
  const { data, mutate } = usePrivateQuery("/v1/client/info");
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
      // config: [1, 2, 3, 4, 5, 10, 15, 20],
      config: config
        ? (config as any)?.available_futures_leverage
            ?.split(",")
            .map((item: string) => parseInt(item))
        : [],
    },
  ];
};
