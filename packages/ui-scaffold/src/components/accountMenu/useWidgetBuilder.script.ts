import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import { WalletConnectorModalId } from "@orderly.network/ui-connector";
import { modal } from "@orderly.network/ui";
import { useCallback, useEffect, useMemo } from "react";
import { useScaffoldContext } from "../scaffoldContext";
import { AccountStatusEnum } from "@orderly.network/types";

export const useAccountMenu = (): any => {
  const { disconnect, connect, connectedChain } = useWalletConnector();
  const { account, state } = useAccount();
  const { unsupported, checkChainSupport } = useScaffoldContext();

  const [_, { findByChainId }] = useChains();

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
    return await connect();

    // if (Array.isArray(wallets) && wallets.length > 0) {
    //   if (!checkChainSupport(wallets[0]!.chains[0]!.id)) return;
    //   onCrateAccount();
    // }
  };

  const statusChangeHandler = (nextState: any) => {
    // console.log("statusChangeHandler", nextState);
    if (nextState.validating || nextState.status <= AccountStatusEnum.Connected)
      return;

    if (nextState.status < AccountStatusEnum.SignedIn) {
      onCrateAccount();
    }
    if (nextState.status < AccountStatusEnum.EnableTrading) {
      onCreateOrderlyKey();
    }
  };

  useEffect(() => {
    account.on("change:status", statusChangeHandler);

    return () => {
      account.off("change:status", statusChangeHandler);
    };
  }, []);

  const onOpenExplorer = useCallback(() => {
    if (!connectedChain) return;
    const chainInfo = findByChainId(
      connectedChain!.id as number,
      "network_infos"
    );

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
  } as const;
};

export type AccountMenuProps = ReturnType<typeof useAccountMenu>;
