import { useEffect, useMemo } from "react";
import { useQuery } from "../useQuery";
import { API, chainsMap } from "@orderly.network/types";
// import { CHAINS } from "../utils/chain";

export const useChain = (
  token: string
): {
  chains: API.Chain | null;
  isLoading: boolean;
} => {
  const { data, isLoading } = useQuery<API.Chain[]>("/v1/public/token");

  const chains = useMemo(() => {
    if (!data) return null;

    let item = data.find((chain) => chain.token === token);

    if (item) {
      item.chain_details = item.chain_details.map((d) => {
        const chain = chainsMap.get(Number(d.chain_id));
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
