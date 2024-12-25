import { useState, useMemo, useCallback, useEffect} from "react";
import { useConfig } from "@orderly.network/hooks";
import { useChains, useWalletConnector, useLocalStorage } from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";

const KEY = 'orderly_selected_chains'
const MAX_STORAGE_CHAINS = 6
export const useChainSelectorBuilder = (options?: {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
}) => {
  const { networkId, bridgeLessOnly } = options || {};
  const config = useConfig();
  const [chains, { checkChainSupport }] = useChains();
  const { setChain, connectedChain } = useWalletConnector();
  const [storageChainsIds, setStorageChainsIds] = useLocalStorage<string[]>(KEY, []);

  const { onChainChanged, currentChainId, setCurrentChainId } = useAppContext();

  const filteredChains = useMemo(() => {
  const filteredChains = bridgeLessOnly
    ? chains.mainnet.filter((chain) => chain.network_infos.bridgeless)
    : chains.mainnet;

    const _chains = {
      mainnet: filteredChains.map((chain) => ({
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

    return _chains
  }, [chains, networkId, bridgeLessOnly]);

  const storageChains = useMemo(() =>  filteredChains?.mainnet?.filter(item => storageChainsIds.includes(item.id)) , [storageChainsIds, filteredChains]) || []; 

  const saveChainIdToLocalStorage = useCallback((id: number) => {
    // if (!storageChainsIds) return 
    if(!filteredChains.mainnet?.filter(item => item.id === id)) return 
    let _storageChains = storageChainsIds?.filter((storageChainsId: number) => storageChainsId !== id)
    _storageChains = [id, ..._storageChains].slice(0, MAX_STORAGE_CHAINS)
    setStorageChainsIds(_storageChains)
  }, [filteredChains.mainnet, storageChainsIds, setStorageChainsIds]);
  
  const onChainChange = async (chain: { id: number }) => {
    // console.log('-- on chanin change ', chain, connectedChain, currentChainId);
    if (!connectedChain) {
      setCurrentChainId(chain.id);
      saveChainIdToLocalStorage(chain.id)
      return {
        result: true,
        wrongNetwork: false,
        chainId: chain.id,
      }
      // return Promise.reject("No connected chain");
    }
    const result = await setChain({
      chainId: chain.id,
    });

    if (!result) return result;
    saveChainIdToLocalStorage(chain.id)
    return {
      result,
      wrongNetwork: !checkChainSupport(
        chain.id,
        config.get("networkId") as NetworkId
      ),
      chainId: chain.id,
    };
  };


  return {
    storageChains,
    chains: filteredChains,
    onChainChange,
    chainChangedCallback: onChainChanged,
    currentChainId: (connectedChain?.id ?? currentChainId )  as number | undefined,
  };
};
