import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { FC, useMemo } from "react";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { cn, ArrowRightShortIcon } from "@orderly.network/ui";
import { AuthGuard } from "@orderly.network/ui-connector";

interface StatusInfo {
  title: string;
  description: string;
  titleColor?: any;
  titleClsName?: string;
}

const useCurrentStatusText = (): StatusInfo => {
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();
  const { t } = useTranslation();

  return useMemo(() => {
    const statusText = {
      wrongNetwork: {
        title: t("connector.wrongNetwork"),
        description: t("connector.wrongNetwork.tooltip"),
        titleColor: "warning",
      },
      connectWallet: {
        title: t("connector.connectWallet"),
        description: t("connector.trade.connectWallet.tooltip"),
        titleClsName:
          "oui-text-transparent oui-bg-clip-text oui-gradient-brand",
      },
      notSignedIn: {
        title: t("connector.signIn"),
        description: t("connector.trade.signIn.tooltip"),
        titleColor: "primary",
      },
      disabledTrading: {
        title: t("connector.enableTrading"),
        description: t("connector.trade.enableTrading.tooltip"),
        titleColor: "primary",
      },
      default: {
        title: "",
        description: "",
      },
    };

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

export const AccountStatusMobile: FC = () => {
  const { title, description, titleColor, titleClsName } = useCurrentStatusText();
  console.log(title, description, titleColor, titleClsName);

  return <AuthGuard  >
    <div className={cn([
    "oui-h-[44px] oui-px-3 oui-py-[10px] oui-w-full oui-rounded-[10px] oui-flex oui-items-center oui-justify-center",
  ])}>
      {description}
    <ArrowRightShortIcon size={18} className={cn(description ? "oui-text-base-contrast-80 oui-ml-1" : "oui-hidden")}/>
  </div>
  </AuthGuard>;
};

