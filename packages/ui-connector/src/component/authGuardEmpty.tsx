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
  fallback?: (props: {
    validating: boolean;
    status: AccountStatusEnum;
  }) => ReactElement;
  // indicator?: ReactElement;
  /**
   * Required state to be satisfied
   * @default AccountStatusEnum.EnableTrading
   */
  status?: AccountStatusEnum;

  buttonProps?: ButtonProps;

  // validatingIndicator?: ReactElement;
};

const AuthGuardEmpty = (props: PropsWithChildren<AuthGuardProps>) => {
  const {
    status = AccountStatusEnum.EnableTrading,
    buttonProps,
    fallback,
  } = props;
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

  const bottomInfo = useMemo(() => {
    const value = state.status;

    if (wrongNetwork) {
      return (
        <Text intensity={36} size="xs" className="oui-mt-4">
          Please switch to a supported network to continue.
        </Text>
      );
    }

    if (value <= AccountStatusEnum.NotConnected) {
      return (
        <Text intensity={36} size="xs" className="oui-mt-4">
          Please Connect wallet before starting to trade
        </Text>
      );
    }
    if (value <= AccountStatusEnum.NotSignedIn) {
      return (
        <Text intensity={36} size="xs" className="oui-mt-4">
          Please sign in before starting to trade
        </Text>
      );
    }
    if (value <= AccountStatusEnum.DisabledTrading) {
      return (
        <Text intensity={36} size="xs" className="oui-mt-4">
          Please Enable trading before starting to trade
        </Text>
      );
    }

    return <></>;
  }, [state]);

  return (
    <Flex direction={"column"}>
      <AuthGuard>{props.children || <EmptyDataState />}</AuthGuard>
      {bottomInfo}
    </Flex>
  );
};

AuthGuardEmpty.displayName = "AuthGuardEmpty";

export { AuthGuardEmpty };
