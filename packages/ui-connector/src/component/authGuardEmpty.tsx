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

  // console.log("!!!state::", state);

  // return Match(state.status)
  //   .with(AccountStatusEnum.EnableTrading, () => props.children)
  //   .with(AccountStatusEnum.DisableTrading, () => props.fallback)
  //   .with(AccountStatusEnum.Validating, () => props.validatingIndicator)
  //   .otherwise(() => props.fallback);
  //

  const Left = useMemo<ReactElement>(() => {
    if (typeof fallback !== "undefined") {
      return fallback({
        validating: state.validating,
        status: state.status,
      });
    }

    if (state.validating) {
      return (
        <Flex direction={"column"} gap={4}>
          <Button
            size="md"
            onClick={() => {
              // onConnectWallet();
            }}
            variant={"gradient"}
            angle={45}
            {...props.buttonProps}
          >
            Connect wallet
          </Button>
          <Text intensity={36} size="2xs">
            Please Connect wallet before starting to trade
          </Text>
        </Flex>
      );
    }

    return <DefaultFallback status={state.status} buttonProps={buttonProps} />;
  }, [state.status, state.validating]);

  return (
    <Either value={state.status === status} left={Left}>
      {props.children || <EmptyDataState />}
    </Either>
  );
};

const DefaultFallback = (props: {
  status: AccountStatusEnum;
  buttonProps?: ButtonProps;
}) => {
  const { connect } = useWalletConnector();
  const onConnectOrderly = () => {
    modal.show(WalletConnectorModalId).then(
      (r) => console.log(r),
      (error) => console.log(error)
    );
  };

  const onConnectWallet = async () => {
    const wallets = await connect();

    console.log("wallets::", wallets);
    if (Array.isArray(wallets) && wallets.length > 0) {
      onConnectOrderly();
    }
  };

  return (
    <Match
      value={props.status}
      case={(value: AccountStatusEnum) => {
        if (value <= AccountStatusEnum.NotConnected) {
          return (
            <Flex direction={"column"} gap={4}>
              <Button
                size="md"
                onClick={() => {
                  onConnectWallet();
                }}
                variant={"gradient"}
                angle={45}
                {...props.buttonProps}
              >
                Connect wallet
              </Button>
              <Text intensity={36} size="2xs">
                Please Connect wallet before starting to trade
              </Text>
            </Flex>
          );
        }
        if (value <= AccountStatusEnum.NotSignedIn) {
          return (
            <Flex direction={"column"} gap={4}>
              <Button
                size="md"
                onClick={() => {
                  onConnectOrderly();
                }}
                angle={45}
                {...props.buttonProps}
              >
                Sigin
              </Button>
              <Text intensity={36} size="2xs">
                Please sign in before starting to trade
              </Text>
            </Flex>
          );
        }
      }}
      default={
        <Flex direction={"column"} gap={4}>
          <Button
            size="md"
            {...props.buttonProps}
            onClick={() => onConnectOrderly()}
          >
            Enable trading
          </Button>
          <Text intensity={36} size="2xs">
            Please Enable trading before starting to trade
          </Text>
        </Flex>
      }
    />
  );
};

AuthGuardEmpty.displayName = "AuthGuardEmpty";

export { AuthGuardEmpty };
