import {
  useAccount,
  useChains,
  useLocalStorage,
  useWalletConnector,
} from "@orderly.network/hooks";
import { WalletConnectorModalId } from "@orderly.network/ui-connector";
import { modal, toast } from "@orderly.network/ui";
import { useCallback, useEffect, useMemo } from "react";
import { useScaffoldContext } from "../scaffoldContext";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";
import { ChainSelectorId } from "@orderly.network/ui-chain-selector";

export const useAccountMenu = (): any => {
  const { disconnect, connectedChain } = useWalletConnector();
  const { account, state } = useAccount();
  const { checkChainSupport } = useScaffoldContext();
  const { connectWallet } = useAppContext();

  const [selectedChainId, seSelectedChainId] = useLocalStorage<string>(
    "orderly_selected_chainId",
    ""
  );

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

  const switchChain = () => {
    account.once("validate:end", (status) => {
      if (status < AccountStatusEnum.EnableTrading) {
        statusChangeHandler({
          status,
        });
      } else {
        toast.success("Wallet connected");
      }
    });

    modal
      .show<{
        wrongNetwork: boolean;
      }>(ChainSelectorId)
      .then(
        (r) => {
          if (!r.wrongNetwork) {
            if (state.status < AccountStatusEnum.EnableTrading) {
              statusChangeHandler(state);
            } else {
              toast.success("Wallet connected");
            }
          }
        },
        (error) => console.log("[switchChain error]", error)
      );
  };

  const connect = async () => {
    const res = await connectWallet();

    if (!res) return;

    if (res.wrongNetwork) {
      switchChain();
    } else {
      statusChangeHandler(res);
    }
  };

  const statusChangeHandler = (nextState: any) => {
    if (nextState.validating || nextState.status <= AccountStatusEnum.Connected)
      return;

    if (nextState.status < AccountStatusEnum.SignedIn) {
      onCrateAccount();
    }
    if (nextState.status < AccountStatusEnum.EnableTrading) {
      onCreateOrderlyKey();
    }
  };

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

  const onDisconnect = async () => {
    await disconnect({
      label: state.connectWallet?.name,
    });
    await account.disconnect();
    selectedChainId && seSelectedChainId("");
  };

  return {
    address: state.address,
    accountState: state,
    connect,
    onCrateAccount,
    onCreateOrderlyKey,
    onOpenExplorer,
    onDisconnect,
  } as const;
};

export type AccountMenuProps = ReturnType<typeof useAccountMenu>;
