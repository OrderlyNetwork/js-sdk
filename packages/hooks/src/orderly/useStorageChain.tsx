import { ChainKey, ChainNamespace, SolanaChains } from "@orderly.network/types";
import { useLocalStorage } from "../useLocalStorage";

export function useStorageChain() {
  const [chain, setChain] = useLocalStorage<{chainId:number, namespace: ChainNamespace} | null>(ChainKey,{chainId: 1, namespace: ChainNamespace.evm});
  const setStorageChain = (chainId: number) => {
    let namespace: ChainNamespace = ChainNamespace.evm;
    if (SolanaChains.has(chainId)) {
      namespace = ChainNamespace.solana;
    }

    setChain({
      chainId: chainId,
      namespace,
    })

  }

  return {
    storageChain: chain,
    setStorageChain,
  }
}