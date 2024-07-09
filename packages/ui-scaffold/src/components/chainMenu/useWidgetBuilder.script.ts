import {
  OrderlyContext,
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";

import { useContext, useEffect, useMemo, useState } from "react";
import { checkChainSupport } from "../../utils/chain";
import { useScaffoldContext } from "../scaffoldContext";

export const useChainMenuBuilderScript = () => {
  const [chains, { findByChainId }] = useChains();
  const { setChain, connectedChain } = useWalletConnector();
  const { state } = useAccount();
  const { unsupported } = useScaffoldContext();

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

  const onChainChange = (chain: { id: number }) => {
    if (!connectedChain) return;
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
    isConnected: !!connectedChain,
    isUnsupported: unsupported,
  };
};

export type UseChainMenuBuilderScript = ReturnType<
  typeof useChainMenuBuilderScript
>;
