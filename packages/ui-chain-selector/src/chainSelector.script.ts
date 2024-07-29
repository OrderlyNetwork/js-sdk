import { useChains, useWalletConnector } from "@orderly.network/hooks";

export const useChainSelectorBuilder = () => {
  const [chains] = useChains();
  const { setChain, connectedChain } = useWalletConnector();

  const onChainChange = (chain: { id: number }) => {
    if (!connectedChain) {
      return Promise.reject("No connected chain");
    }
    return setChain({
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
    onChainChange,
    currentChainId: connectedChain?.id as number | undefined,
  };
};
