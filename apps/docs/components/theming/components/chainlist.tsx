import { useChains } from "@orderly.network/hooks";
import { ChainListView } from "@orderly.network/react";

export const ChainListComponent = () => {
  const [chains] = useChains(undefined, {
    pick: "network_infos",
  });
  return (
    <ChainListView
      mainChains={chains?.mainnet}
      testChains={chains?.testnet}
      currentChainId={42161}
    />
  );
};
