import { useMemo } from "react";
import { useQuery } from "../useQuery";
import { API, chainsInfoMap } from "@orderly.network/types";

export const useChain = (token: string) => {
  const { data, isLoading } = useQuery<API.Chain[]>("/v1/public/token");

  const chains = useMemo(() => {
    if (!data) return null;

    let item = data.find((chain) => chain.token === token);

    if (item) {
      item.chain_details = item.chain_details.map((d) => {
        const chain = chainsInfoMap.get(Number(d.chain_id));
        return {
          ...d,
          chain_name: chain?.chainName ?? "--",
        };
      });
    }

    return item || null;
  }, [data, token]);

  return { chains, isLoading };
};
