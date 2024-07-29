import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum, NetworkId } from "@orderly.network/types";
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

const LABELS = {
  connectWallet: "Connect wallet",
  switchChain: "Switch chain",
  enableTrading: "Enable trading",
  signin: "Sigin",
};

export type AuthGuardProps = {
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

  description?: string;

  labels?: {
    connectWallet?: string;
    switchChain?: string;
    enableTrading?: string;
    signin?: string;
  };

  classNames?: {
    root?: string;
    description?: string;
    // button?: string;
  };

  networkId?: NetworkId;

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

  const labels = { ...LABELS, ...props.labels };

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
          {labels.connectWallet}
        </Button>
      );
    }

    return (
      <DefaultFallback
        status={state.status}
        buttonProps={buttonProps}
        wrongNetwork={wrongNetwork}
        networkId={props.networkId}
      />
    );
  }, [state.status, state.validating, buttonProps, wrongNetwork]);

  /**
   * **Important: The chldren component will be rendered only if the status is equal to the required status and the network is correct.**
   */
  return (
    <Either value={state.status === status && !wrongNetwork} left={Left}>
      {props.children}
    </Either>
  );
};

const DefaultFallback = (props: {
  status: AccountStatusEnum;
  wrongNetwork: boolean;
  buttonProps?: ButtonProps;
  networkId?: NetworkId;
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
    modal
      .show(ChainSelectorId, {
        networkId: props.networkId,
      })
      .then(
        (r) => console.log(r),
        (error) => console.log(error)
      );
  };

  if (props.wrongNetwork) {
    return (
      <Button
        color="warning"
        // size="md"
        // fullWidth
        onClick={() => {
          switchChain();
        }}
        {...buttonProps}
      >
        {LABELS.switchChain}
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
              // fullWidth
              variant={"gradient"}
              angle={45}
              {...buttonProps}
            >
              {LABELS.connectWallet}
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
              // fullWidth
              angle={45}
              {...buttonProps}
            >
              {LABELS.signin}
            </Button>
          );
        }
      }}
      default={
        <Button
          size="lg"
          // fullWidth
          {...buttonProps}
          onClick={() => onConnectOrderly()}
        >
          {LABELS.enableTrading}
        </Button>
      }
    />
  );
};

AuthGuard.displayName = "AuthGuard";

export { AuthGuard };
