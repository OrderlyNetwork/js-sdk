import { useMemo } from "react";
import { useChains, useWalletConnector } from "@orderly.network/hooks";
import { isTestnet } from "@orderly.network/utils";

export function useGetChains() {
  const { connectedChain } = useWalletConnector();

  const [mainChains, { findByChainId }] = useChains("mainnet", {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const chainName = useMemo(() => {
    // @ts-ignore
    const chain = findByChainId(parseInt(connectedChain?.id!), "network_infos");

    if (!chain) {
      return "Unknown";
    }
    // @ts-ignore
    if (isTestnet(chain.chain_id)) {
      return "Testnet";
    }
    // @ts-ignore
    return chain.name;
  }, [connectedChain, findByChainId]);

  return chainName;
}
