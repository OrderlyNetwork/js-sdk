import { useAccount, useConfig } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { isTestnet } from "@orderly.network/utils";
import { useMemo } from "react";

export const useChainScript = () => {
  const { account } = useAccount();
  const config= useConfig();

  const isTestnetChain = useMemo(() => {
    if (account.chainId) {
      // if (`${account}`.startsWith("0x")) {

      // }
      return isTestnet(Number(account.chainId));
    }
    return undefined;
  }, [account.chainId]);
  const { wrongNetwork } = useAppContext();
  return {
    chainId: account.chainId,
    isTestnetChain,
    networkId: config.get("networkId"),
    isWrongNetwork: wrongNetwork,
  };
};

export type ChainState = ReturnType<typeof useChainScript>;
