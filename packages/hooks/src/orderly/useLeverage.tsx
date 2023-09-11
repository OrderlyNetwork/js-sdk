import { useCallback } from "react";
import { useMutation } from "../useMutation";
import { usePrivateQuery } from "../usePrivateQuery";

import { prop } from "ramda";

export const useLeverage = () => {
  const { data, mutate } = usePrivateQuery("/v1/client/info");
  const [update] = useMutation("/v1/client/leverage");

  const updateLeverage = useCallback((data: any) => {
    return update(data).then((res: any) => {
      return mutate();
      // return res
    });
  }, []);

  return [prop("max_leverage", data), { update: updateLeverage }];
};
