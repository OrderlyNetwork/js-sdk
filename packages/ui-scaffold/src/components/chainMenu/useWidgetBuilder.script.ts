import {
  OrderlyContext,
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";

import { useContext, useEffect, useMemo, useState } from "react";
import { checkChainSupport } from "../../utils/chain";

export const useChainMenuBuilderScript = () => {
  const [chains, { findByChainId }] = useChains();
  const { setChain, connectedChain } = useWalletConnector();
  const { state } = useAccount();
  const { networkId } = useContext<any>(OrderlyContext);
  const [unsupported, setUnsupported] = useState(true);

  const currentChain = useMemo(() => {
    const chainId = state.connectWallet?.chainId;
    let chain;

    if (chainId) {
      chain = findByChainId(chainId);
    }

    if (chain) {
      return {
        name: chain.network_infos.name,
        id: chainId,
        lowestFee: chain.network_infos.bridgeless,
      };
    }

    // if (!chain) return null;
    // if chain is null then return the first chain
    const firstChain = chains.mainnet?.[0]?.network_infos;

    if (!firstChain) return null;

    return {
      name: firstChain.name,
      id: firstChain.chain_id,
      lowestFee: firstChain.bridgeless,
    };
  }, [state, chains]);

  // console.log("currentChain::", currentChain);
  //
  useEffect(() => {
    if (!connectedChain) return;

    let isSupported = checkChainSupport(
      connectedChain.id,
      networkId === "testnet" ? chains.testnet : chains.mainnet
    );

    setUnsupported(isSupported);
  }, [connectedChain?.id, chains]);

  const onChainChange = (chain: { id: number }) => {
    // console.log("onChainChange", chain);
    if (!state.connectWallet) return;
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
    currentChain,
    onChange: onChainChange,
    isSupported: unsupported,
  };
};

export type UseChainMenuBuilderScript = ReturnType<
  typeof useChainMenuBuilderScript
>;
