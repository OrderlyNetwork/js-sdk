import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@orderly.network/hooks";
import { WalletConnectorModalId } from "@orderly.network/ui-connector";
import { modal, toast } from "@orderly.network/ui";
import { useCallback } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { useAppContext } from "@orderly.network/react-app";
import { ChainSelectorDialogId } from "@orderly.network/ui-chain-selector";
import { useTranslation } from "@orderly.network/i18n";

export const useAccountMenu = (): any => {
  const { t } = useTranslation();
  const { disconnect, connectedChain } = useWalletConnector();
  const { account, state } = useAccount();
  const { connectWallet, disabledConnect } = useAppContext();

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
        toast.success(t("connector.walletConnected"));
      }
    });

    modal
      .show<{
        wrongNetwork: boolean;
      }>(ChainSelectorDialogId)
      .then(
        (r) => {
          if (!r.wrongNetwork) {
            if (state.status < AccountStatusEnum.EnableTrading) {
              statusChangeHandler(state);
            } else {
              toast.success(t("connector.walletConnected"));
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
    localStorage.removeItem("orderly_link_device");
    await disconnect({
      label: state.connectWallet?.name,
    });
    await account.disconnect();
  };

  return {
    address: state.address,
    accountState: state,
    connect,
    onCrateAccount,
    onCreateOrderlyKey,
    onOpenExplorer,
    onDisconnect,
    disabledConnect,
  } as const;
};

export type AccountMenuProps = ReturnType<typeof useAccountMenu>;
