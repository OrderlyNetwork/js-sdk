import { useCallback } from "react";
import { useMutation } from "../useMutation";
import { usePrivateQuery } from "../usePrivateQuery";
import { prop } from "ramda";
import { useQuery } from "../useQuery";

export const useLeverage = () => {
  const { data, mutate } = usePrivateQuery("/v1/client/info");
  const [update] = useMutation("/v1/client/leverage");

  const { data: config } = useQuery("/v1/public/config");

  const updateLeverage = useCallback((data: any) => {
    return update(data).then((res: any) => {
      console.log(res);
      if (res.success) {
        return mutate();
      } else {
        throw new Error(res.message);
      }
      // return res
    });
  }, []);

  return [
    prop("max_leverage", data),
    {
      update: updateLeverage,
      // config: [1, 2, 3, 4, 5, 10, 15, 20],
      config: config
        ? (config as any)?.available_futures_leverage
            ?.split(",")
            .map((item: string) => parseInt(item))
        : [],
    },
  ] as [
    number | undefined,
    { update: typeof updateLeverage; config: number[] }
  ];
};
