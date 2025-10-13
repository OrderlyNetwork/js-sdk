import { useCallback } from "react";
import {
  useAccount,
  useChains,
  useWalletConnector,
} from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { useAppContext } from "@kodiak-finance/orderly-react-app";
import { AccountStatusEnum } from "@kodiak-finance/orderly-types";
import { modal, toast, useScreen, Text } from "@kodiak-finance/orderly-ui";
import {
  ChainSelectorDialogId,
  ChainSelectorSheetId,
} from "@kodiak-finance/orderly-ui-chain-selector";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "@kodiak-finance/orderly-ui-connector";

const ModalTitle = () => {
  const { t } = useTranslation();
  const { state } = useAccount();
  if (state.status < AccountStatusEnum.SignedIn) {
    return <Text>{t("connector.createAccount")}</Text>;
  }
  if (state.status < AccountStatusEnum.EnableTrading) {
    return <Text>{t("connector.enableTrading")}</Text>;
  }
  return <Text>{t("connector.connectWallet")}</Text>;
};

export const useAccountMenu = (): any => {
  const { t } = useTranslation();
  const { disconnect, connectedChain } = useWalletConnector();
  const { account, state } = useAccount();
  const { connectWallet, disabledConnect, wrongNetwork, setCurrentChainId } =
    useAppContext();

  const [, { findByChainId }] = useChains();

  const { isMobile } = useScreen();

  const onCrateAccount = async () => {
    const modalId = isMobile ? WalletConnectorSheetId : WalletConnectorModalId;
    modal
      .show(modalId, {
        title: <ModalTitle />,
      })
      .then(
        (res) => console.log("return ::", res),
        (err) => console.log("error:::", err),
      );
  };

  const onCreateOrderlyKey = async () => {
    const modalId = isMobile ? WalletConnectorSheetId : WalletConnectorModalId;
    modal
      .show(modalId, {
        title: <ModalTitle />,
      })
      .then(
        (res) => console.log("return ::", res),
        (err) => console.log("error:::", err),
      );
  };

  const switchChain = () => {
    account.once("validate:end", (status) => {
      if (status < AccountStatusEnum.EnableTrading) {
        statusChangeHandler({ status });
      } else {
        toast.success(t("connector.walletConnected"));
      }
    });

    modal.show<{ wrongNetwork: boolean }>(ChainSelectorDialogId).then(
      (r) => {
        if (!r.wrongNetwork) {
          if (state.status < AccountStatusEnum.EnableTrading) {
            statusChangeHandler(state);
          } else {
            toast.success(t("connector.walletConnected"));
          }
        }
      },
      (error) => {
        console.log("[switchChain error]", error);
      },
    );
  };

  const connect = async () => {
    const res = await connectWallet();

    if (!res) {
      return;
    }

    if (res.wrongNetwork) {
      switchChain();
    } else {
      statusChangeHandler(res);
    }
  };

  const statusChangeHandler = (nextState: any) => {
    if (
      nextState.validating ||
      nextState.status <= AccountStatusEnum.Connected
    ) {
      return;
    }

    if (nextState.status < AccountStatusEnum.SignedIn) {
      onCrateAccount();
    }
    if (nextState.status < AccountStatusEnum.EnableTrading) {
      onCreateOrderlyKey();
    }
  };

  const onOpenExplorer = useCallback(() => {
    if (!connectedChain) {
      return;
    }
    const chainInfo = findByChainId(
      connectedChain!.id as number,
      "network_infos",
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

  const onSwitchNetwork = () => {
    const modalId = isMobile ? ChainSelectorSheetId : ChainSelectorDialogId;
    modal
      .show<{
        wrongNetwork: boolean;
      }>(modalId, {
        bridgeLessOnly: false,
        isWrongNetwork: wrongNetwork,
      })
      .then(
        (r: any) => {
          console.log(r?.chainId);
          if (r?.chainId) {
            setCurrentChainId(r?.chainId);
          }
          toast.success(t("connector.networkSwitched"));
        },
        (error) => console.log("[switchChain error]", error),
      );
  };

  return {
    address: state.address,
    accountState: state,
    connect,
    onCrateAccount,
    onCreateOrderlyKey,
    onOpenExplorer,
    onDisconnect,
    onSwitchNetwork,
    wrongNetwork,
    disabledConnect,
    isMobile,
  } as const;
};

export type AccountMenuProps = ReturnType<typeof useAccountMenu>;
