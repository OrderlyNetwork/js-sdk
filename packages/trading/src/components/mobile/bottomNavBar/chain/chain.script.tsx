import { useAccount, useConfig, useWalletConnector } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { isTestnet } from "@orderly.network/utils";
import { useEffect, useMemo, useState } from "react";

export const useChainScript = () => {
  const { account } = useAccount();
  const config= useConfig();
  const [chainId, setChainId] = useState<string |number | undefined>(account.chainId);

  useEffect(() => {
    setChainId(account.chainId);
  }, [account.chainId]);

  const isTestnetChain = useMemo(() => {
    if (chainId) {
      return isTestnet(Number(chainId));
    }
    return undefined;
  }, [chainId]);
  const { wrongNetwork } = useAppContext();
  const networkId = config.get("networkId");
  const defaultChainId = useMemo(() => {

    if (networkId === 'testnet') {

      return 421614;
    }
    return 42161;

  }, []);
  
  return {
    defaultChainId,
    chainId,
    setChainId,
    isTestnetChain,
    networkId,
    isWrongNetwork: wrongNetwork,
  };
};

export type ChainState = ReturnType<typeof useChainScript>;
