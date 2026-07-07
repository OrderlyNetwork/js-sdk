import {
  ChainKey,
  ChainNamespace,
  getChainNamespaceByChainId,
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
    const namespace =
      namespaceOverride ??
      getChainNamespaceByChainId(chainId) ??
      ChainNamespace.evm;

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
