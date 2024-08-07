import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  Button,
  Either,
  EmptyDataState,
  Flex,
  Match,
  modal,
  Text,
  type ButtonProps,
} from "@orderly.network/ui";
import { PropsWithChildren, ReactElement, useMemo } from "react";
import { WalletConnectorModalId } from "./walletConnector";
import { useAppContext } from "@orderly.network/react-app";
import { AuthGuard } from "./authGuard";

type AuthGuardProps = {
  hint?: {
    connectWallet?: string;
    signIn?: string;
    enableTrading?: string;
    wrongNetwork?: string;
  };
};

const AuthGuardEmpty = (props: PropsWithChildren<AuthGuardProps>) => {
  const {
    hint = {
      connectWallet: "Please connect wallet before starting to trade",
      signIn: "Please sign in before starting to trade",
      enableTrading: "Please sign in before starting to trade",
      wrongNetwork: "Please switch to a supported network to continue.",
    },
  } = props;
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

  const bottomInfo = useMemo(() => {
    const value = state.status;

    if (wrongNetwork) {
      return hint.wrongNetwork ?? "";
    }

    if (value <= AccountStatusEnum.NotConnected) {
      return hint.connectWallet ?? "";
    }
    if (value <= AccountStatusEnum.NotSignedIn) {
      return hint.signIn ?? "";
    }
    if (value <= AccountStatusEnum.DisabledTrading) {
      return hint.enableTrading ?? "";
    }

    return "";
  }, [state, hint]);

  return (
    <Flex direction={"column"} my={8}>
      <AuthGuard>{props.children || <EmptyDataState />}</AuthGuard>
      {bottomInfo.length > 0 && (
        <Text intensity={36} size="xs" className="oui-mt-4">
          {bottomInfo}
        </Text>
      )}
    </Flex>
  );
};

AuthGuardEmpty.displayName = "AuthGuardEmpty";

export { AuthGuardEmpty };
