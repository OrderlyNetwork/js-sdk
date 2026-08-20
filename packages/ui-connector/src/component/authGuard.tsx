import React, { ReactElement, useCallback, useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum, NetworkId } from "@orderly.network/types";
import {
  Button,
  Either,
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

const useConnectWalletHandler = (options: {
  networkId?: NetworkId;
  bridgeLessOnly?: boolean;
}) => {
  const { networkId, bridgeLessOnly } = options;
  const { t } = useTranslation();
  const { connectWallet } = useAppContext();
  const { account, state } = useAccount();
  const { isMobile } = useScreen();

  const openWalletConnector = useCallback(
    (status: AccountStatusEnum) => {
      modal
        .show(isMobile ? WalletConnectorSheetId : WalletConnectorModalId, {
          initAccountState: status,
          title: <ModalTitle status={status} />,
        })
        .catch(() => {});
    },
    [isMobile],
  );

  const onConnectOrderly = useCallback(() => {
    openWalletConnector(state.status);
  }, [openWalletConnector, state.status]);

  const handleAccountStatus = useCallback(
    (status?: AccountStatusEnum) => {
      if (
        typeof status !== "undefined" &&
        status > AccountStatusEnum.Connected &&
        status < AccountStatusEnum.EnableTrading
      ) {
        openWalletConnector(status);
      }
    },
    [openWalletConnector],
  );

  const switchChain = useCallback(() => {
    const handleValidateEnd = (status: AccountStatusEnum) => {
      if (status < AccountStatusEnum.EnableTrading) {
        handleAccountStatus(status);
      } else {
        toast.success(t("connector.walletConnected"));
      }
    };

    account.once("validate:end", handleValidateEnd);

    modal
      .show<{ wrongNetwork: boolean }>(
        isMobile ? ChainSelectorSheetId : ChainSelectorDialogId,
        {
          networkId,
          bridgeLessOnly,
        },
      )
      .then(
        (result) => {
          if (result.wrongNetwork) {
            account.off("validate:end", handleValidateEnd);
          }
        },
        (error) => {
          account.off("validate:end", handleValidateEnd);
          console.error("[switchChain error]", error);
        },
      );
  }, [account, bridgeLessOnly, handleAccountStatus, isMobile, networkId, t]);

  const onConnectWallet = useCallback(async () => {
    try {
      const res = await connectWallet();

      if (!res) {
        return;
      }

      if (res.wrongNetwork) {
        switchChain();
      } else {
        handleAccountStatus(res.status);
      }
    } catch (error) {
      console.error(error);
    }
  }, [connectWallet, handleAccountStatus, switchChain]);

  return { onConnectOrderly, onConnectWallet, switchChain };
};

export const AuthGuard: React.FC<React.PropsWithChildren<AuthGuardProps>> = (
  props,
) => {
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
  const { onConnectOrderly, onConnectWallet, switchChain } =
    useConnectWalletHandler({ networkId, bridgeLessOnly });

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
        onConnectOrderly={onConnectOrderly}
        onConnectWallet={onConnectWallet}
        switchChain={switchChain}
      />
    );
  }, [
    state.status,
    state.validating,
    buttonProps,
    wrongNetwork,
    labels,
    descriptions,
    onConnectOrderly,
    onConnectWallet,
    switchChain,
  ]);

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

const ModalTitle: React.FC<{ status?: AccountStatusEnum }> = ({ status }) => {
  const { t } = useTranslation();
  const { state } = useAccount();
  const displayStatus =
    typeof status !== "undefined" && state.status < status
      ? status
      : state.status;
  if (displayStatus < AccountStatusEnum.SignedIn) {
    return <Text>{t("connector.createAccount")}</Text>;
  }
  if (displayStatus < AccountStatusEnum.EnableTrading) {
    return <Text>{t("connector.enableTrading")}</Text>;
  }
  return <Text>{t("connector.connectWallet")}</Text>;
};

const DefaultFallback: React.FC<{
  status: AccountStatusEnum;
  wrongNetwork: boolean;
  buttonProps?: ButtonProps;
  networkId?: NetworkId;
  labels: alertMessages;
  bridgeLessOnly?: boolean;
  descriptions?: alertMessages;
  disabledConnect?: boolean;
  onConnectOrderly: () => void;
  onConnectWallet: () => Promise<void>;
  switchChain: () => void;
}> = (props) => {
  const { buttonProps, labels, descriptions } = props;
  const { onConnectOrderly, onConnectWallet, switchChain } = props;

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

  if (props.status <= AccountStatusEnum.NotConnected || props.disabledConnect) {
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

  if (props.status <= AccountStatusEnum.NotSignedIn) {
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

  return (
    <StatusInfo
      size="lg"
      // fullWidth
      description={descriptions?.enableTrading}
      {...buttonProps}
      onClick={() => onConnectOrderly()}
    >
      {labels.enableTrading}
    </StatusInfo>
  );

  // return (
  //   <Match
  //     value={props.status}
  //     case={(value: AccountStatusEnum) => {
  //       if (value <= AccountStatusEnum.NotConnected || props.disabledConnect) {
  //         return (
  //           <StatusInfo
  //             size="lg"
  //             onClick={() => {
  //               onConnectWallet();
  //             }}
  //             // fullWidth
  //             variant={props.disabledConnect ? undefined : "gradient"}
  //             angle={45}
  //             description={descriptions?.connectWallet}
  //             disabled={props.disabledConnect}
  //             {...buttonProps}
  //           >
  //             {labels.connectWallet}
  //           </StatusInfo>
  //         );
  //       }
  //       if (value <= AccountStatusEnum.NotSignedIn) {
  //         return (
  //           <StatusInfo
  //             size="lg"
  //             onClick={() => {
  //               onConnectOrderly();
  //             }}
  //             // fullWidth
  //             angle={45}
  //             description={descriptions?.signin}
  //             {...buttonProps}
  //           >
  //             {labels.signin}
  //           </StatusInfo>
  //         );
  //       }
  //     }}
  //     default={
  //       <StatusInfo
  //         size="lg"
  //         // fullWidth
  //         description={descriptions?.enableTrading}
  //         {...buttonProps}
  //         onClick={() => onConnectOrderly()}
  //       >
  //         {labels.enableTrading}
  //       </StatusInfo>
  //     }
  //   />
  // );
};

AuthGuard.displayName = "AuthGuard";

const StatusInfo: React.FC<ButtonProps & { description?: string }> = (
  props,
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
