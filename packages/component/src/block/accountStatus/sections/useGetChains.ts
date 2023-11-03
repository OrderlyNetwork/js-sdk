import { useContext, useMemo } from "react";
import { WalletConnectorContext } from "@/provider";
import { useChains } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";

export function useGetChains() {
  const { connectedChain } = useContext(WalletConnectorContext);

  const [mainChains, { findByChainId }] = useChains("mainnet", {
    wooSwapEnabled: true,
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const chainName = useMemo(() => {
    const chain = findByChainId(parseInt(connectedChain?.id!), "network_infos");

    if (!chain) {
      return "Unknown";
    }

    if (chain.chain_id === 421613) {
      return "Testnet";
    }

    return chain.name;
  }, [connectedChain, findByChainId]);

  return chainName;
}
