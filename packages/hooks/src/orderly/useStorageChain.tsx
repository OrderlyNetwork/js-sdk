import {
  ChainKey,
  ChainNamespace,
  SolanaChains,
  SuiChains,
} from "@orderly.network/types";
import { useLocalStorage } from "../useLocalStorage";

export function useStorageChain() {
  const [chain, setChain] = useLocalStorage<{
    chainId: number;
    namespace: ChainNamespace;
  } | null>(ChainKey, null);
  const setStorageChain = (
    chainId: number,
    namespaceOverride?: ChainNamespace,
  ) => {
    let namespace: ChainNamespace = namespaceOverride || ChainNamespace.evm;
    if (!namespaceOverride && SolanaChains.has(chainId)) {
      namespace = ChainNamespace.solana;
    }
    if (!namespaceOverride && SuiChains.has(chainId)) {
      namespace = ChainNamespace.sui;
    }

    setChain({
      chainId: chainId,
      namespace,
    });
  };

  return {
    storageChain: chain,
    setStorageChain,
  };
}
