export const useChainMenuBuilderScript = () => {
  return {
    chains: {
      mainnet: [
        {
          name: "ETH",
          id: 1,
        },
        {
          name: "Avalanche",
          id: 43114,
        },
      ],
      testnet: [
        {
          name: "Arbitrum",
          id: 42161,
        },
      ],
    },
    currentChain: {
      name: "ETH",
      id: 1,
    },
  };
};

export type UseChainMenuBuilderScript = ReturnType<
  typeof useChainMenuBuilderScript
>;
