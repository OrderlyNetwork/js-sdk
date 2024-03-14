import { useState, useEffect } from "react";
import { API, CurrentChain } from "@orderly.network/types";

export function useChainNotSupport(
  chain: CurrentChain,
  chains: API.NetworkInfos[]
) {
  const [chainNotSupport, setChainNotSupport] = useState(false);

  const checkSupport = (
    chain: CurrentChain,
    chains: API.NetworkInfos[]
  ): boolean => {
    if (!chain || !chains) return false;

    const index = chains?.findIndex((c) => c.chain_id === chain.id);

    return index < 0;
  };

  useEffect(() => {
    setChainNotSupport(checkSupport(chain, chains));
  }, [chains, chain]);

  return chainNotSupport;
}
