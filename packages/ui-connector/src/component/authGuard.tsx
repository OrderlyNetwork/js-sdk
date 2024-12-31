import {
  useAccount,
  useMediaQuery,
  useEventEmitter,
  useConfig,
  useNetworkInfo,
} from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  MEDIA_TABLET,
  NetworkId,
  EnumTrackerKeys,
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
import { useAppContext } from "@orderly.network/react-app";
import {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  WalletConnectorModalId,
  WalletConnectorSheetId,
} from "./walletConnector";
import {
  ChainSelectorId,
  ChainSelectorSheetId,
} from "@orderly.network/ui-chain-selector";
import { alertMessages, DESCRIPTIONS, LABELS } from "../constants/message";
import { Flex } from "@orderly.network/ui";
import { Box } from "@orderly.network/ui";

type ChainProps = {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
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
    status = AccountStatusEnum.EnableTrading,
    buttonProps,
    fallback,
    descriptions,
    classNames,
    networkId,
    id,
    bridgeLessOnly,
    // ...rest
  } = props;
  const { state, account } = useAccount();
  const { wrongNetwork } = useAppContext();
  const [connect, setConnect] = useState(false);
  const ee = useEventEmitter();
  const config = useConfig();
  const { wallet, network } = useNetworkInfo();

  const labels = { ...LABELS, ...props.labels };

  useEffect(() => {
    if (network && wallet && connect) {
      ee.emit(EnumTrackerKeys["wallet:connected"], {
        // @ts-ignore
        wallet,
        network,
        sdk_version:
          window?.__ORDERLY_VERSION__?.["@orderly.network/net"] ?? "",
        address: account?.address,
        broker_id: config.get("brokerId"),
        account_id: account?.accountId,
      });
    }
  }, [wallet, network, connect]);

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
        setConnect={setConnect}
      />
    );
  }, [state.status, state.validating, buttonProps, wrongNetwork]);

  /**
   * **Important: The chldren component will be rendered only if the status is equal to the required status and the network is correct.**
   */

  return (
    <Either value={state.status >= status && !wrongNetwork} left={Left}>
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
  setConnect?: (c: boolean) => void;
}) => {
  const { buttonProps, labels, descriptions, setConnect } = props;
  const { connectWallet } = useAppContext();
  const { account } = useAccount();
  const { isMobile } = useScreen();
  const matches = useMediaQuery(MEDIA_TABLET);
  const onConnectOrderly = () => {
    modal.show(matches ? WalletConnectorSheetId : WalletConnectorModalId).then(
      (r) => {},
      (error) => console.log(error)
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
        setConnect?.(true);
        onConnectOrderly();
      }
    }
  };

  const switchChain = () => {
    account.once("validate:end", (status) => {
      if (status < AccountStatusEnum.EnableTrading) {
        onConnectOrderly();
      } else {
        toast.success("Wallet connected");
      }
    });

    modal
      .show<{
        wrongNetwork: boolean;
      }>(isMobile ? ChainSelectorSheetId : ChainSelectorId, {
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
                toast.success("Wallet connected");
              }
            }
          }
        },
        (error) => console.log("[switchChain error]", error)
      );
  };

  if (props.wrongNetwork) {
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
        if (value <= AccountStatusEnum.NotConnected) {
          return (
            <StatusInfo
              size="lg"
              onClick={() => {
                onConnectWallet();
              }}
              // fullWidth
              variant={"gradient"}
              angle={45}
              description={descriptions?.connectWallet}
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
  }
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
