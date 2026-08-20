import { useCallback, useEffect } from "react";
import {
  useAccount,
  useChains,
  useEventEmitter,
  useWalletConnector,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal, toast, useScreen, Text } from "@orderly.network/ui";
import {
  ChainSelectorDialogId,
  ChainSelectorSheetId,
} from "@orderly.network/ui-chain-selector";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "@orderly.network/ui-connector";

const ModalTitle = ({ status }: { status?: AccountStatusEnum }) => {
  const { t } = useTranslation();
  const { state } = useAccount();
  const displayStatus =
    typeof status !== "undefined" && state.status < status
      ? status
      : state.status;
  if (displayStatus < AccountStatusEnum.SignedIn) {
    return <Text>{t("connector.createAccount")}</Text>;
  }
  if (displayStatus < AccountStatusEnum.EnableTrading) {
    return <Text>{t("connector.enableTrading")}</Text>;
  }
  return <Text>{t("connector.connectWallet")}</Text>;
};

const WALLET_CONNECT_OAUTH_RESUME_RESULT = "wallet:connect-oauth-resume-result";

type WalletConnectOAuthResumeResult = {
  status?: AccountStatusEnum;
  wrongNetwork?: boolean;
  handled?: boolean;
};

export const useAccountMenu = (): any => {
  const { t } = useTranslation();
  const { disconnect, connectedChain } = useWalletConnector();
  const { account, state } = useAccount();
  const ee = useEventEmitter();
  const { connectWallet, disabledConnect, wrongNetwork, setCurrentChainId } =
    useAppContext();

  const [, { findByChainId }] = useChains();

  const { isMobile } = useScreen();

  const openWalletConnector = useCallback(
    async (status: AccountStatusEnum = state.status) => {
      const modalId = isMobile
        ? WalletConnectorSheetId
        : WalletConnectorModalId;
      modal
        .show(modalId, {
          initAccountState: status,
          title: <ModalTitle status={status} />,
        })
        .catch(() => {});
    },
    [isMobile, state.status],
  );

  const statusChangeHandler = useCallback(
    (status?: AccountStatusEnum) => {
      if (
        typeof status === "undefined" ||
        status <= AccountStatusEnum.Connected ||
        status >= AccountStatusEnum.EnableTrading
      ) {
        return;
      }

      openWalletConnector(status);
    },
    [openWalletConnector],
  );

  const switchChain = useCallback(() => {
    // Chain selection resolves before account validation, so this is the only
    // authoritative signal for opening the onboarding modal.
    const handleValidateEnd = (status: AccountStatusEnum) => {
      if (status < AccountStatusEnum.EnableTrading) {
        statusChangeHandler(status);
      } else {
        toast.success(t("connector.walletConnected"));
      }
    };

    account.once("validate:end", handleValidateEnd);

    const modalId = isMobile ? ChainSelectorSheetId : ChainSelectorDialogId;
    modal.show<{ wrongNetwork: boolean }>(modalId).then(
      (r) => {
        if (r.wrongNetwork) {
          account.off("validate:end", handleValidateEnd);
        }
      },
      (error) => {
        account.off("validate:end", handleValidateEnd);
        console.log("[switchChain error]", error);
      },
    );
  }, [account, isMobile, statusChangeHandler, t]);

  useEffect(() => {
    const handleOAuthResumeResult = (
      result?: WalletConnectOAuthResumeResult,
    ) => {
      if (!result || result.handled) {
        return;
      }
      result.handled = true;
      if (result.wrongNetwork) {
        switchChain();
      } else {
        statusChangeHandler(result.status);
      }
    };

    ee.on(WALLET_CONNECT_OAUTH_RESUME_RESULT, handleOAuthResumeResult);
    return () => {
      ee.off(WALLET_CONNECT_OAUTH_RESUME_RESULT, handleOAuthResumeResult);
    };
  }, [ee, statusChangeHandler, switchChain]);

  const connect = async () => {
    const res = await connectWallet();

    if (!res) {
      return;
    }

    if (res.wrongNetwork) {
      switchChain();
    } else {
      statusChangeHandler(res.status);
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
    onCrateAccount: openWalletConnector,
    onCreateOrderlyKey: openWalletConnector,
    onOpenExplorer,
    onDisconnect,
    onSwitchNetwork,
    wrongNetwork,
    disabledConnect,
    isMobile,
  } as const;
};

export type AccountMenuProps = ReturnType<typeof useAccountMenu>;
