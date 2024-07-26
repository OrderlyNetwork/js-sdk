import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  Button,
  Either,
  Match,
  modal,
  type ButtonProps,
} from "@orderly.network/ui";
import { useAppContext } from "@orderly.network/react-app";
import { PropsWithChildren, ReactElement, useMemo } from "react";
import { WalletConnectorModalId } from "./walletConnector";
import { ChainSelectorId } from "@orderly.network/ui-chain-selector";

type AuthGuardProps = {
  fallback?: (props: {
    validating: boolean;
    status: AccountStatusEnum;
    wrongNetwork: boolean;
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

const AuthGuard = (props: PropsWithChildren<AuthGuardProps>) => {
  const {
    status = AccountStatusEnum.EnableTrading,
    buttonProps,
    fallback,
  } = props;
  const { state } = useAccount();
  const { wrongNetwork } = useAppContext();

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
        wrongNetwork,
      });
    }

    if (state.validating) {
      return (
        <Button
          // variant={"gradient"}
          angle={45}
          fullWidth
          disabled
          loading
          {...buttonProps}
        >
          Connect wallet
        </Button>
      );
    }

    return (
      <DefaultFallback
        status={state.status}
        buttonProps={buttonProps}
        wrongNetwork={wrongNetwork}
      />
    );
  }, [state.status, state.validating]);

  return (
    <Either value={state.status === status} left={Left}>
      {props.children}
    </Either>
  );
};

const DefaultFallback = (props: {
  status: AccountStatusEnum;
  wrongNetwork: boolean;
  buttonProps?: ButtonProps;
}) => {
  const { buttonProps } = props;
  const { connectWallet } = useAppContext();
  // const { connect } = useWalletConnector();
  const onConnectOrderly = () => {
    modal.show(WalletConnectorModalId).then(
      (r) => console.log(r),
      (error) => console.log(error)
    );
  };

  const onConnectWallet = async () => {
    const res = await connectWallet();

    if (!res) return;

    if (res?.status < AccountStatusEnum.EnableTrading) {
      onConnectOrderly();
    }
  };

  const switchChain = () => {
    modal.show(ChainSelectorId).then(
      (r) => console.log(r),
      (error) => console.log(error)
    );
  };

  if (props.wrongNetwork) {
    return (
      <Button
        color="warning"
        // size="md"
        fullWidth
        onClick={() => {
          switchChain();
        }}
        {...buttonProps}
      >
        Wrong network
      </Button>
    );
  }

  return (
    <Match
      value={props.status}
      case={(value: AccountStatusEnum) => {
        if (value <= AccountStatusEnum.NotConnected) {
          return (
            <Button
              onClick={() => {
                onConnectWallet();
              }}
              fullWidth
              variant={"gradient"}
              angle={45}
              {...buttonProps}
            >
              Connect wallet
            </Button>
          );
        }
        if (value <= AccountStatusEnum.NotSignedIn) {
          return (
            <Button
              size="lg"
              onClick={() => {
                onConnectOrderly();
              }}
              fullWidth
              angle={45}
              {...buttonProps}
            >
              Sigin
            </Button>
          );
        }
      }}
      default={
        <Button
          size="lg"
          fullWidth
          {...buttonProps}
          onClick={() => onConnectOrderly()}
        >
          Enable trading
        </Button>
      }
    />
  );
};

AuthGuard.displayName = "AuthGuard";

export { AuthGuard };
