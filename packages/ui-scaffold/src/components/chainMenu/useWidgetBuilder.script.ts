import {
  useChains,
  useConfig,
  useAccount,
  useLocalStorage,
  useWalletConnector,
} from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";
import { useMemo, useCallback, useEffect, useState } from "react";
import { useAppContext } from "@orderly.network/react-app";

const KEY = "orderly_selected_chains";
const MAX_STORAGE_CHAINS = 6;

export const useChainMenuBuilderScript = () => {
  const [chains] = useChains();
  const { state } = useAccount();
  const { setChain, connectedChain } = useWalletConnector();
  const [storageChainsIds, setStorageChainsIds] = useLocalStorage<string[]>(
    KEY,
    []
  );
  const { wrongNetwork, onChainChanged, currentChainId, setCurrentChainId } =
    useAppContext();

  const networkId = useConfig("networkId") as NetworkId;

  useEffect(() => {
    if (connectedChain) {
      setCurrentChainId?.(
        typeof connectedChain.id === "number"
          ? connectedChain.id
          : parseInt(connectedChain.id)
      );
    } else {
      if (!!currentChainId) return;
      const firstChain =
        networkId === "mainnet"
          ? chains.mainnet?.[0]?.network_infos
          : chains.testnet?.[0]?.network_infos;
      if (!firstChain) return;
      setCurrentChainId?.(firstChain.chain_id);
    }
  }, [connectedChain, chains, currentChainId, networkId]);

  const _chains = useMemo(() => {
    return {
      mainnet: chains.mainnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
        isTestnet: false,
      })),
      testnet: chains.testnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
        isTestnet: true,
      })),
    };
  }, [chains]);

  const storageChains =
    useMemo(
      () =>
        _chains?.mainnet?.filter((item) => storageChainsIds.includes(item.id)),
      [storageChainsIds, _chains]
    ) || [];

  const saveChainIdToLocalStorage = useCallback(
    (id: number) => {
      if (!_chains.mainnet?.filter((item) => item.id === id)) return;
      let _storageChains = storageChainsIds?.filter(
        (storageChainsId: number) => storageChainsId !== id
      );
      _storageChains = [id, ..._storageChains].slice(0, MAX_STORAGE_CHAINS);
      setStorageChainsIds(_storageChains);
    },
    [_chains.mainnet, storageChainsIds, setStorageChainsIds]
  );

  const onChainChange = async (chain: { id: number; isTestnet: boolean }) => {
    // if (!connectedChain) return;
    setCurrentChainId(chain.id);

    if (connectedChain) {
      const result = await setChain({
        chainId: chain.id,
      });
      if (!result) return;
      onChainChanged?.(chain.id, {
        isTestnet: chain.isTestnet,
        isWalletConnected: true,
      });
    } else {
      onChainChanged?.(chain.id, {
        isTestnet: chain.isTestnet,
        isWalletConnected: false,
      });
    }
    saveChainIdToLocalStorage(chain.id);
  };

  return {
    chains: _chains,
    storageChains,
    // currentChain,
    currentChainId,
    onChange: onChainChange,
    isConnected: !!connectedChain,
    wrongNetwork,
    accountStatus: state.status,
    networkId,
  };
};

export type UseChainMenuBuilderScript = ReturnType<
  typeof useChainMenuBuilderScript
>;
