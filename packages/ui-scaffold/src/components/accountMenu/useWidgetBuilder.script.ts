import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import { WalletConnectorModalId } from "@orderly.network/ui-connector";
import { modal } from "@orderly.network/ui";
import { useCallback, useMemo } from "react";

export const useAccountMenu = () => {
  const { disconnect, connect, connectedChain } = useWalletConnector();
  const { account, state } = useAccount();

  const [chains, { findByChainId }] = useChains(undefined, {
    // pick: "network_infos",
  });

  console.log("_____chains___", chains);

  // const chains = useMemo(() => {
  //   if (Array.isArray(allChains)) return allChains;
  //   if (allChains === undefined) return [];

  //   // @ts-ignore
  //   if (connectedChain && isTestnet(parseInt(connectedChain.id))) {
  //     return allChains.testnet ?? [];
  //   }

  //   return allChains.mainnet;
  // }, [allChains]);

  const onCrateAccount = async () => {
    modal.show(WalletConnectorModalId).then(
      (res) => console.log("return ::", res),
      (err) => console.log("error:::", err)
    );
  };

  const onCreateOrderlyKey = async () => {
    modal.show(WalletConnectorModalId).then(
      (res) => console.log("return ::", res),
      (err) => console.log("error:::", err)
    );
  };

  const onConnectWallet = async () => {
    const wallets = await connect();

    console.log("wallets::", wallets);
    if (Array.isArray(wallets) && wallets.length > 0) {
      // await account.connect(wallets[0]);
      onCrateAccount();
    }
  };

  const onOpenExplorer = useCallback(() => {
    console.log("onOpenExploer::", connectedChain);
    if (!connectedChain) return;
    const chainInfo = findByChainId(connectedChain!.id as number);
    console.log("chainInfo::", chainInfo);

    if (chainInfo) {
      // @ts-ignore
      const { explorer_base_url } = chainInfo;
      if (explorer_base_url) {
        if (explorer_base_url.endsWith("/")) {
          window.open(`${explorer_base_url}address/${account.address}`);
        } else {
          window.open(`${explorer_base_url}/address/${account.address}`);
        }
      }
    }
  }, [state, connectedChain]);

  return {
    address: state.address,
    accountState: state,
    onConnectWallet,
    onCrateAccount,
    onCreateOrderlyKey,
    onOpenExplorer,
    onDisconnect: async () => {
      await disconnect({
        label: state.connectWallet?.name,
      });
      await account.disconnect();
    },
  };
};

export type AccountMenuProps = ReturnType<typeof useAccountMenu>;
