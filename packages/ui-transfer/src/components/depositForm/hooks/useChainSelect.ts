import { useCallback, useMemo } from "react";
import {
  Chain,
  ConnectedChain,
  useChains,
  useConfig,
  useLocalStorage,
  useWalletConnector,
} from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { API, NetworkId } from "@kodiak-finance/orderly-types";
import { toast } from "@kodiak-finance/orderly-ui";
import { int2hex, praseChainIdToNumber } from "@kodiak-finance/orderly-utils";

export type CurrentChain = Pick<ConnectedChain, "namespace"> & {
  id: number;
  info?: Chain;
};

export function useChainSelect() {
  const { t } = useTranslation();
  const networkId = useConfig("networkId") as NetworkId;
  const [linkDeviceStorage] = useLocalStorage("orderly_link_device", {});

  const { connectedChain, settingChain, setChain } = useWalletConnector();

  const [chains, { findByChainId }] = useChains(networkId, {
    pick: "network_infos",
    filter: (chain: any) =>
      chain.network_infos?.bridge_enable || chain.network_infos?.bridgeless,
  });

  const currentChain = useMemo(() => {
    const chainId = connectedChain
      ? praseChainIdToNumber(connectedChain.id)
      : parseInt(linkDeviceStorage?.chainId);

    if (!chainId) return null;

    const chain = findByChainId(chainId);

    return {
      ...connectedChain,
      id: chainId,
      info: chain!,
    } as CurrentChain;
  }, [findByChainId, connectedChain, linkDeviceStorage]);

  const onChainChange = useCallback(
    async (chain: API.NetworkInfos) => {
      const chainInfo = findByChainId(chain.chain_id);

      if (!connectedChain) {
        return;
      }

      if (
        !chainInfo ||
        chainInfo.network_infos?.chain_id === currentChain?.id
      ) {
        return Promise.resolve();
      }

      return setChain({
        chainId: int2hex(Number(chainInfo.network_infos?.chain_id)),
      })
        .then((switched) => {
          if (switched) {
            toast.success(t("connector.networkSwitched"));
          } else {
            toast.error(t("connector.switchChain.failed"));
          }
        })
        .catch((error) => {
          if (error && error.message) {
            toast.error(
              `${t("connector.switchChain.failed")}: ${error.message}`,
            );
          }
        });
    },
    [currentChain, setChain, findByChainId],
  );

  return {
    chains,
    currentChain,
    settingChain,
    onChainChange,
  };
}
