import { PropsWithChildren } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";
import { Box, EmptyDataState } from "@orderly.network/ui";
import { AuthGuard } from "./authGuard";

type AuthGuardProps = {
  hint?: {
    connectWallet?: string;
    signIn?: string;
    enableTrading?: string;
    wrongNetwork?: string;
  };
  status?: AccountStatusEnum;
};

const AuthGuardEmpty = (props: PropsWithChildren<AuthGuardProps>) => {
  const { t } = useTranslation();
  const {
    hint = {
      connectWallet: t("connector.trade.connectWallet.tooltip"),
      signIn: t("connector.trade.createAccount.tooltip"),
      enableTrading: t("connector.trade.enableTrading.tooltip"),
      wrongNetwork: t("connector.wrongNetwork.tooltip"),
    },
    status,
  } = props;

  return (
    <Box my={8}>
      <AuthGuard
        status={status}
        descriptions={{ ...hint, switchChain: hint.wrongNetwork }}
      >
        {props.children || <EmptyDataState />}
      </AuthGuard>
    </Box>
  );
};

AuthGuardEmpty.displayName = "AuthGuardEmpty";

export { AuthGuardEmpty };
