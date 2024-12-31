import {  useMemo } from "react";
import {
  Chain,
  ConnectedChain,
  useAccount,
  useWalletConnector,
  useConfig,
  useChains,
} from "./";
import { praseChainIdToNumber } from "@orderly.network/utils";
import { NetworkId } from "@orderly.network/types";

export type CurrentChain = Pick<ConnectedChain, "namespace"> & {
  id: number;
  info?: Chain;
};

export const useNetworkInfo = () => {
    const { state } = useAccount();
    const {
      connectedChain,
      wallet,
      setChain: switchChain,
      settingChain,
    } = useWalletConnector();

    const networkId = useConfig("networkId") as NetworkId;

    const [allChains, { findByChainId }] = useChains(networkId, {
      pick: "network_infos",
      filter: (chain: any) =>
        chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
    });

    const currentChain = useMemo(() => {
      if (!connectedChain) return null;

      const chainId = praseChainIdToNumber(connectedChain.id);
      const chain = findByChainId(chainId);

      return {
        ...connectedChain,
        id: chainId,
        info: chain!,
      } as CurrentChain;
    }, [connectedChain, findByChainId]);

  return {
    network: currentChain?.info?.network_infos?.name,
    wallet: state?.connectWallet?.name,
  };
};
