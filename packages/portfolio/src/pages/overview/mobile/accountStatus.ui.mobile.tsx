import { FC, useCallback, useMemo } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import {
  cn,
  ArrowRightShortIcon,
  modal,
  toast,
  formatAddress,
} from "@orderly.network/ui";
import { ChainSelectorSheetId } from "@orderly.network/ui-chain-selector";
import {
  AuthGuard,
  WalletConnectorSheetId,
} from "@orderly.network/ui-connector";

interface StatusInfo {
  title: string;
  description: string;
  titleColor?: any;
  titleClsName?: string;
}

const useCurrentStatus = () => {
  const { state, account } = useAccount();
  const { wrongNetwork, disabledConnect, connectWallet } = useAppContext();
  const { t } = useTranslation();

  const onConnectOrderly = () => {
    modal.show(WalletConnectorSheetId).then(
      (r) => console.log(r),
      (error) => console.log(error),
    );
  };

  const onConnectWallet = async () => {
    const res = await connectWallet();

    if (!res) return;

    if (res.wrongNetwork) {
      switchChain();
    } else {
      if (
        (res?.status ?? AccountStatusEnum.NotConnected) <
        AccountStatusEnum.EnableTrading
      ) {
        onConnectOrderly();
      }
    }
  };

  const switchChain = () => {
    account.once("validate:end", (status) => {
      if (status < AccountStatusEnum.EnableTrading) {
        onConnectOrderly();
      } else {
        toast.success(t("connector.walletConnected"));
      }
    });

    modal
      .show<{
        wrongNetwork: boolean;
      }>(ChainSelectorSheetId, {
        networkId: undefined,
        bridgeLessOnly: false,
      })
      .then(
        (r) => {
          if (!r.wrongNetwork) {
            if (state.status >= AccountStatusEnum.Connected) {
              if (state.status < AccountStatusEnum.EnableTrading) {
                onConnectOrderly();
              } else {
                toast.success(t("connector.walletConnected"));
              }
            }
          }
        },
        (error) => console.log("[switchChain error]", error),
      );
  };

  const statusText = {
    wrongNetwork: {
      description: t("connector.wrongNetwork.tooltip"),
      rootClass: "oui-bg-gradient-to-r oui-from-[#FF7B00] oui-to-[#FFEA00]",
      arrowIconClass: "oui-text-primary",
      textClass: "oui-text-transparent oui-bg-clip-text oui-gradient-brand",
      doAction: switchChain,
    },
    connectWallet: {
      description: t("connector.trade.connectWallet.tooltip"),
      rootClass: "oui-bg-gradient-to-r oui-from-[#FF7B00] oui-to-[#FFEA00]",
      arrowIconClass: "oui-text-primary",
      textClass: `oui-bg-gradient-to-r oui-from-[#FF7B00] oui-to-[#FFEA00]
           oui-text-transparent oui-bg-clip-text oui-gradient-brand`,
      doAction: onConnectWallet,
    },
    notSignedIn: {
      description: t("connector.trade.signIn.tooltip"),
      rootClass: "oui-bg-[linear-gradient(15deg,#FF7B00_-11%,transparent_30%)]",
      arrowIconClass: "oui-text-primary",
      textClass: "oui-text-transparent oui-bg-clip-text oui-gradient-brand",
      doAction: onConnectOrderly,
    },
    disabledTrading: {
      description: t("connector.trade.enableTrading.tooltip"),
      rootClass:
        "oui-bg-[linear-gradient(15deg,rgb(var(--oui-color-primary))_-11%,transparent_30%)]",
      arrowIconClass: "oui-text-primary",
      textClass: "oui-text-primary",
      doAction: onConnectOrderly,
    },
    default: {
      description: "",
      rootClass: "",
      arrowIconClass: "",
      textClass: "",
      doAction: () => {},
    },
  };

  return useMemo(() => {
    if (disabledConnect) {
      return statusText.connectWallet;
    }

    if (wrongNetwork) {
      return statusText.wrongNetwork;
    }

    switch (state.status) {
      case AccountStatusEnum.NotConnected:
        return statusText.connectWallet;
      case AccountStatusEnum.NotSignedIn:
        return statusText.notSignedIn;
      case AccountStatusEnum.DisabledTrading:
        return statusText.disabledTrading;
      default:
        return statusText.default;
    }
  }, [state.status, wrongNetwork]);
};

const ShowAccount: FC = () => {
  const { state, account } = useAccount();
  const { namespace } = useWalletConnector();

  const leftNode = useMemo(() => {
    if (!state.address) {
      return;
    }
    return <div>{formatAddress(state.address ?? "")}</div>;
  }, [state.address]);
  const rightNode = useMemo(() => {
    return <div>{namespace}</div>;
  }, [namespace]);

  const bgClass = useMemo(() => {
    let bg = "";
    if (namespace == ChainNamespace.evm) {
      bg =
        "oui-bg-[linear-gradient(15deg,#283BEE_-11%,transparent_30%,transparent_77%,#A53411_100%)]";
    } else if (namespace == ChainNamespace.solana) {
      bg = "oui-bg-gradient-to-r oui-from-[#FF7B00] oui-to-[#FFEA00]";
    }
    return bg;
  }, [namespace]);
  return (
    <div
      className={cn([
        "oui-flex oui-h-[44px] oui-w-full oui-items-center oui-justify-between oui-rounded-[10px] oui-px-3 oui-py-[10px]",
        bgClass,
      ])}
    >
      {leftNode}
      {rightNode}
    </div>
  );
};

export const AccountStatusMobile: FC = () => {
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();
  const { description, rootClass, arrowIconClass, textClass, doAction } =
    useCurrentStatus();

  const alreadyShowAccount = useMemo(() => {
    if (wrongNetwork) {
      return false;
    }
    return (
      state.status >= AccountStatusEnum.EnableTrading ||
      state.status === AccountStatusEnum.EnableTradingWithoutConnected
    );
  }, [state.status, wrongNetwork]);

  if (alreadyShowAccount) {
    return <ShowAccount />;
  }

  return (
    <div
      className={cn([
        "oui-flex oui-h-[44px] oui-w-full oui-items-center oui-justify-center oui-rounded-[10px] oui-px-3 oui-py-[10px]",
        rootClass,
        // "oui-bg-linear-65",
        // "oui-from-[-20%]",
        // "oui-to-[40%]",
        // " oui-from-[#FF7B00]",
        // " oui-to-[#FFEA00]",
      ])}
      onClick={doAction}
    >
      <div
        className={cn(
          "oui-flex oui-items-center oui-justify-end oui-rounded-[10px] oui-text-xs oui-font-semibold",
          // "oui-bg-gradient-to-r oui-from-[#FF7B00] oui-to-[#FFEA00]",
          // "oui-text-transparent oui-bg-clip-text oui-gradient-brand",
          textClass,
        )}
      >
        {description}
      </div>
      <ArrowRightShortIcon
        opacity={1}
        size={22}
        className={cn(arrowIconClass)}
      />
    </div>
  );
};
