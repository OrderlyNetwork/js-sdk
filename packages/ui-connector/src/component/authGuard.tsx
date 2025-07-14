import { PropsWithChildren, ReactElement, useMemo } from "react";
import { useAccount, useMediaQuery } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import {
  AccountStatusEnum,
  MEDIA_TABLET,
  NetworkId,
} from "@orderly.network/types";
import {
  Button,
  Either,
  Match,
  modal,
  Text,
  toast,
  useScreen,
  type ButtonProps,
} from "@orderly.network/ui";
import { Flex } from "@orderly.network/ui";
import { Box } from "@orderly.network/ui";
import {
  ChainSelectorDialogId,
  ChainSelectorSheetId,
} from "@orderly.network/ui-chain-selector";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "./walletConnector";

type ChainProps = {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
};

export type alertMessages = {
  connectWallet?: string;
  switchChain?: string;
  enableTrading?: string;
  signin?: string;
};

export type AuthGuardProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
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

  bridgeLessOnly?: boolean;

  buttonProps?: ButtonProps;

  descriptions?: alertMessages;

  labels?: alertMessages;

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
    status,
    buttonProps,
    fallback,
    descriptions,
    classNames,
    networkId,
    id,
    bridgeLessOnly,
    // ...rest
  } = props;
  const { t } = useTranslation();
  const { state } = useAccount();
  const { wrongNetwork, disabledConnect } = useAppContext();

  const _status = useMemo(() => {
    if (status === undefined) {
      return state.status === AccountStatusEnum.EnableTradingWithoutConnected
        ? AccountStatusEnum.EnableTradingWithoutConnected
        : AccountStatusEnum.EnableTrading;
    }
    return status;
  }, [status, state.status]);

  const labels = {
    connectWallet: t("connector.connectWallet"),
    switchChain: t("connector.wrongNetwork"),
    enableTrading: t("connector.enableTrading"),
    signin: t("connector.createAccount"),
    ...props.labels,
  };

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

    if (state.validating && !disabledConnect) {
      return (
        <StatusInfo
          // variant={"gradient"}
          angle={45}
          // fullWidth
          disabled
          loading
          description={descriptions?.connectWallet}
          id={id}
          type="button"
          {...buttonProps}
        >
          {labels.connectWallet}
        </StatusInfo>
      );
    }

    return (
      <DefaultFallback
        bridgeLessOnly={bridgeLessOnly}
        status={state.status}
        buttonProps={{ ...buttonProps, id, type: "button" }}
        wrongNetwork={wrongNetwork}
        networkId={props.networkId}
        labels={labels}
        descriptions={descriptions}
        disabledConnect={disabledConnect}
      />
    );
  }, [state.status, state.validating, buttonProps, wrongNetwork]);

  /**
   * **Important: The chldren component will be rendered only if the status is equal to the required status and the network is correct.**
   */

  return (
    <Either
      value={state.status >= _status && !wrongNetwork && !disabledConnect}
      left={Left}
    >
      {props.children}
    </Either>
  );
};

const DefaultFallback = (props: {
  status: AccountStatusEnum;
  wrongNetwork: boolean;
  buttonProps?: ButtonProps;
  networkId?: NetworkId;
  labels: alertMessages;
  bridgeLessOnly?: boolean;
  descriptions?: alertMessages;
  disabledConnect?: boolean;
}) => {
  const { buttonProps, labels, descriptions } = props;
  const { t } = useTranslation();
  const { connectWallet } = useAppContext();
  const { account } = useAccount();
  const { isMobile } = useScreen();
  const matches = useMediaQuery(MEDIA_TABLET);

  const onConnectOrderly = () => {
    modal.show(matches ? WalletConnectorSheetId : WalletConnectorModalId).then(
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
      }>(isMobile ? ChainSelectorSheetId : ChainSelectorDialogId, {
        networkId: props.networkId,
        bridgeLessOnly: props.bridgeLessOnly,
      })
      .then(
        (r) => {
          if (!r.wrongNetwork) {
            if (props.status >= AccountStatusEnum.Connected) {
              if (props.status < AccountStatusEnum.EnableTrading) {
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

  if (props.wrongNetwork && !props.disabledConnect) {
    return (
      <StatusInfo
        color="warning"
        // size="md"
        // fullWidth
        onClick={() => {
          switchChain();
        }}
        description={descriptions?.switchChain}
        {...buttonProps}
      >
        {labels.switchChain}
      </StatusInfo>
    );
  }

  return (
    <Match
      value={props.status}
      case={(value: AccountStatusEnum) => {
        if (value <= AccountStatusEnum.NotConnected || props.disabledConnect) {
          return (
            <StatusInfo
              size="lg"
              onClick={() => {
                onConnectWallet();
              }}
              // fullWidth
              variant={props.disabledConnect ? undefined : "gradient"}
              angle={45}
              description={descriptions?.connectWallet}
              disabled={props.disabledConnect}
              {...buttonProps}
            >
              {labels.connectWallet}
            </StatusInfo>
          );
        }
        if (value <= AccountStatusEnum.NotSignedIn) {
          return (
            <StatusInfo
              size="lg"
              onClick={() => {
                onConnectOrderly();
              }}
              // fullWidth
              angle={45}
              description={descriptions?.signin}
              {...buttonProps}
            >
              {labels.signin}
            </StatusInfo>
          );
        }
      }}
      default={
        <StatusInfo
          size="lg"
          // fullWidth
          description={descriptions?.enableTrading}
          {...buttonProps}
          onClick={() => onConnectOrderly()}
        >
          {labels.enableTrading}
        </StatusInfo>
      }
    />
  );
};

AuthGuard.displayName = "AuthGuard";

const StatusInfo = (
  props: ButtonProps & {
    description?: string;
  },
) => {
  const { description, ...buttonProps } = props;
  return (
    <Flex direction={"column"}>
      <Button {...buttonProps}></Button>
      {!!description && (
        <Box mt={4} className="oui-leading-none" style={{ lineHeight: 0 }}>
          <Text size="2xs" intensity={36}>
            {description}
          </Text>
        </Box>
      )}
    </Flex>
  );
};

export { AuthGuard };
