import { useAccount } from "@orderly.network/hooks";
import { isTestnet } from "@orderly.network/utils";
import { useMemo } from "react";

export const useChainScript = () => {
  const { account } = useAccount();

  const isTestnetChain = useMemo(() => {
    if (account.chainId) {
      // if (`${account}`.startsWith("0x")) {

      // }
      return isTestnet(Number(account.chainId));
    }
    return undefined;
  }, [account.chainId]);
  return {
    chainId: account.chainId,
    isTestnetChain,
  };
};

export type ChainState = ReturnType<typeof useChainScript>;
