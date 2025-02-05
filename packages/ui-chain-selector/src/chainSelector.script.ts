import { useMemo, useCallback, useState, useEffect } from "react";
import { useConfig } from "@orderly.network/hooks";
import {
  useChains,
  useWalletConnector,
  useLocalStorage,
} from "@orderly.network/hooks";
import { NetworkId } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";
import { ChainType, TChainItem } from "./type";

const KEY = "orderly_selected_chains";
const MAX_RECENT_CHAINS = 6;

export type UseChainSelectorScriptReturn = ReturnType<
  typeof useChainSelectorScript
>;

export type UseChainSelectorScriptOptions = {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
  close?: () => void;
  resolve?: (isSuccess: boolean) => void;
  reject?: () => void;
  onChainChangeBefore?: (chain: TChainItem) => void;
  onChainChangeAfter?: (chain: TChainItem) => void;
};

export const useChainSelectorScript = (
  options: UseChainSelectorScriptOptions
) => {
  const { networkId, bridgeLessOnly } = options || {};

  const config = useConfig();
  const [_chains, { checkChainSupport }] = useChains();
  const { setChain, connectedChain } = useWalletConnector();

  const { onChainChanged, currentChainId, setCurrentChainId, wrongNetwork } =
    useAppContext();

  const [selectChainId, setSelectChainId] = useState<number | undefined>(
    currentChainId
  );

  const chains = useMemo(() => {
    const bridgeLessChains = bridgeLessOnly
      ? _chains.mainnet.filter((chain) => chain.network_infos.bridgeless)
      : _chains.mainnet;

    return {
      mainnet: bridgeLessChains.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
        isTestnet: false,
      })),
      testnet: _chains.testnet.map((chain) => ({
        name: chain.network_infos.name,
        id: chain.network_infos.chain_id,
        lowestFee: chain.network_infos.bridgeless,
        isTestnet: true,
      })),
    };
  }, [_chains, bridgeLessOnly]);

  const { recentChains, saveRecentChain } = useRecentChains(chains);

  const onChainChange = async (chain: TChainItem) => {
    if (connectedChain) {
      const result = await setChain({ chainId: chain.id });

      if (!result) return result;

      return {
        result,
        wrongNetwork: !checkChainSupport(chain.id, config.get("networkId")),
        chainId: chain.id,
      };
    }

    setCurrentChainId(chain.id);
    return {
      result: true,
      wrongNetwork: false,
      chainId: chain.id,
    };
    // return Promise.reject("No connected chain");
  };

  const onChainClick = async (chain: TChainItem) => {
    setSelectChainId(chain.id);
    options.onChainChangeBefore?.(chain);

    const complete = await onChainChange?.(chain);

    if (complete) {
      options.onChainChangeAfter?.(chain);
      options.resolve?.(complete);
      options.close?.();
      saveRecentChain(chain);
      onChainChanged?.(chain.id, {
        isTestnet: chain.isTestnet,
        isWalletConnected: true,
      });
    } else {
      setSelectChainId(undefined);
      onChainChanged?.(chain.id, {
        isTestnet: chain.isTestnet,
        isWalletConnected: false,
      });
    }
  };

  const { selectedTab, onTabChange } = useChainTab(
    chains,
    currentChainId,
    wrongNetwork
  );

  return {
    recentChains,
    chains,
    selectChainId,
    onChainClick,
    selectedTab,
    onTabChange,
  };
};

function useChainTab(
  chains: Record<NetworkId, TChainItem[]>,
  currentChainId?: number,
  wrongNetwork?: boolean
) {
  const [selectedTab, setSelectedTab] = useState<ChainType>(ChainType.Mainnet);

  const onTabChange = (tab: ChainType) => {
    setSelectedTab(tab);
  };

  useEffect(() => {
    if (currentChainId) {
      const isMainnet = chains.mainnet?.some(
        (chain) => chain.id === currentChainId
      );
      if (isMainnet) {
        setSelectedTab(wrongNetwork ? ChainType.Testnet : ChainType.Mainnet);
        return;
      }

      const isTestnet = chains.testnet?.some(
        (chain) => chain.id === currentChainId
      );

      if (isTestnet) {
        setSelectedTab(wrongNetwork ? ChainType.Mainnet : ChainType.Testnet);
        return;
      }
    }
  }, [currentChainId, chains, wrongNetwork]);

  return { selectedTab, onTabChange };
}

function useRecentChains(chains: Record<NetworkId, TChainItem[]>) {
  const [recentChainsIds, setRecentChainsIds] = useLocalStorage<string[]>(
    KEY,
    []
  );

  const recentChains = useMemo<TChainItem[]>(() => {
    return recentChainsIds?.map((id: string) =>
      chains.mainnet?.find((item) => item.id === parseInt(id))
    );
  }, [chains, recentChainsIds]);

  const saveRecentChain = useCallback(
    (chain: TChainItem) => {
      // only mainnet can save chain id to local storage
      if (chain.isTestnet) {
        return;
      }
      let ids = recentChainsIds?.filter((id: number) => id !== chain.id);
      ids = [chain.id, ...ids].slice(0, MAX_RECENT_CHAINS);
      setRecentChainsIds(ids);
    },
    [recentChainsIds]
  );

  return { recentChains, saveRecentChain };
}
