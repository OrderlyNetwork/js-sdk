import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useMemo } from "react";

export const useChainMenuBuilderScript = () => {
  const [chains, { findByChainId }] = useChains();
  const { setChain } = useWalletConnector();
  const { state } = useAccount();

  // console.log("wallet *****", account, state);
  const currentChain = useMemo(() => {
    const chainId = state.connectWallet?.chainId;

    if (!chainId) return null;

    const chain = findByChainId(chainId);

    if (!chain) return null;

    return {
      name: chain.network_infos.name,
      id: chainId,
      lowestFee: chain.network_infos.bridgeless,
    };
  }, [state]);

  const onChainChange = (chain) => {
    // console.log("onChainChange", chain);
    setChain({
      chainId: chain.id,
    });
  };

  return {
    chains: {
      mainnet: chains.mainnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
      })),
      testnet: chains.testnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
      })),
    },
    currentChain,
    onChange: onChainChange,
  };
};

export type UseChainMenuBuilderScript = ReturnType<
  typeof useChainMenuBuilderScript
>;
