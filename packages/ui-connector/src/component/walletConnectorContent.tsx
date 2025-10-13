import { FC, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useEventEmitter,
  useLocalStorage,
  useStorageLedgerAddress,
  useWalletConnector,
} from "@kodiak-finance/orderly-hooks";
import { i18n, useTranslation } from "@kodiak-finance/orderly-i18n";
import {
  AccountStatusEnum,
  ChainNamespace,
  LedgerWalletKey,
} from "@kodiak-finance/orderly-types";
import {
  Box,
  Button,
  capitalizeFirstLetter,
  Divider,
  Flex,
  inputFormatter,
  modal,
  Switch,
  Text,
  TextField,
  toast,
  Tooltip,
} from "@kodiak-finance/orderly-ui";
import { StepItem } from "./step";

export type WalletConnectContentProps = {
  initAccountState: AccountStatusEnum;
  signIn: () => Promise<any>;
  enableTrading: (remember: boolean) => Promise<any>;
  enableTradingComplted?: () => Promise<void>;
  onCompleted?: () => void;
  close?: () => void;
  refCode: string;
  setRefCode: React.Dispatch<React.SetStateAction<string>>;
  helpText?: string;
  showRefCodeInput: boolean;
};

export const WalletConnectContent = (props: WalletConnectContentProps) => {
  const { initAccountState = AccountStatusEnum.NotConnected } = props;
  const [remember, setRemember] = useState(true);
  const ee = useEventEmitter();
  const { t } = useTranslation();
  const { disconnect, namespace } = useWalletConnector();

  const { state: accountState, account } = useAccount();
  const [state, setState] = useState(initAccountState);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLedgerButton, setShowLedgerButton] = useState(false);
  const { ledgerWallet, setLedgerAddress } = useStorageLedgerAddress();
  const handleRef = useRef(0);
  const [firstShowDialog] = useLocalStorage(
    "orderly-first-show-wallet-connector-dialog",
    undefined,
  );
  useEffect(() => {
    return () => {
      localStorage.setItem("orderly-first-show-wallet-connector-dialog", "1");
    };
  }, []);

  useEffect(() => {
    setState(accountState.status);
  }, [accountState]);

  const steps = useMemo(() => {
    const steps = [];
    if (initAccountState < AccountStatusEnum.SignedIn) {
      steps.push({
        key: "signIn",
        title: t("connector.createAccount"),
        description: t("connector.createAccount.description"),
      });
    }

    if (initAccountState < AccountStatusEnum.EnableTrading) {
      steps.push({
        key: "enableTrading",
        title: t("connector.enableTrading"),
        description: t("connector.enableTrading.description"),
      });
    }

    return steps;
  }, [initAccountState, t]);

  useEffect(() => {
    if (namespace != ChainNamespace.solana) {
      setShowLedgerButton(false);
      return;
    }
    if (!ledgerWallet) {
      setShowLedgerButton(true);
      return;
    }
    if (ledgerWallet && account.address) {
      if (!ledgerWallet.includes(account.address)) {
        setShowLedgerButton(true);
        return;
      }
    }
    setShowLedgerButton(false);
  }, [namespace, account.address, ledgerWallet]);

  const onEnableTrading = () => {
    setLoading(true);
    return props
      .enableTrading(remember)
      .then(
        async (res) => {
          handleRef.current++;
          console.log(res);
          setLoading(false);
          setActiveStep((step) => step + 1);
          try {
            await props.enableTradingComplted?.();
          } catch (e) {}
          if (typeof props.onCompleted === "function") {
            props.onCompleted();
          } else if (typeof props.close === "function") {
            props.close();
          }
          // props.onCompleted?.();
        },
        (reject) => {
          setLoading(false);
          if (reject === -1) {
            return;
          }

          if (
            reject.message.indexOf(
              "Signing off chain messages with Ledger is not yet supported",
            ) !== -1
          ) {
            ee.emit("wallet:sign-message-with-ledger-error", {
              message: reject.message,
              userAddress: account.address,
            });
            return;
          }
          toast.error(paseErrorMsg(reject));
        },
      )
      .catch((e) => {
        console.log("enable trading catch error", e);
        setLoading(false);
      });
  };

  const onDisconnect = async () => {
    localStorage.removeItem("orderly_link_device");
    disconnect({
      label: (state as unknown as any).connectWallet?.name,
    }).then(() => {
      account.disconnect();
      if (typeof props.close === "function") {
        props.close();
      }
    });
  };

  const onSignIn = () => {
    setLoading(true);
    return props
      .signIn()
      .then(
        (res) => {
          setActiveStep((step) => step + 1);
          onEnableTrading();
        },
        (reject) => {
          setLoading(false);

          if (reject === -1) {
            return;
          }
          if (
            reject.message.indexOf(
              "Signing off chain messages with Ledger is not yet supported",
            ) !== -1
          ) {
            ee.emit("wallet:sign-message-with-ledger-error", {
              message: reject.message,
              userAddress: account.address,
            });
            return;
          }

          toast.error(paseErrorMsg(reject));
        },
      )
      .catch((e) => {
        setLoading(false);
      });
  };

  return (
    <Box id="oui-wallet-connect-dialog-content" className="oui-font-semibold">
      <Text intensity={54} size="xs">
        {t("connector.expired")}
      </Text>
      <Box
        p={4}
        my={6}
        intensity={600}
        r="lg"
        className="oui-space-y-5"
        position={"relative"}
      >
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          return (
            <StepItem
              title={step.title}
              description={step.description}
              isCompleted={activeStep > index}
              key={step.key}
              active={activeStep === index}
              isLoading={loading && activeStep === index}
              showDivider={!isLast}
            />
          );
        })}
      </Box>
      {props.showRefCodeInput && steps.length == 2 && (
        <ReferralCode {...props} />
      )}
      {firstShowDialog && (
        <Flex justify={"between"} itemAlign={"center"}>
          <RememberMe />
          <Switch
            color={"primary"}
            checked={remember}
            onCheckedChange={setRemember}
            disabled={loading}
            className="data-[state=checked]:oui-bg-primary-darken"
          />
        </Flex>
      )}
      <Flex justify={"center"} mt={8} className="oui-w-full">
        <Box className="oui-w-full">
          <ActionButton
            state={state}
            signIn={onSignIn}
            enableTrading={onEnableTrading}
            loading={loading}
            disabled={state >= AccountStatusEnum.EnableTrading}
            showLedgerButton={showLedgerButton}
          />
        </Box>
      </Flex>
      {state > AccountStatusEnum.NotConnected && (
        <Flex
          justify={"center"}
          mt={4}
          gap={1}
          className="oui-w-full oui-cursor-pointer"
          onClick={onDisconnect}
        >
          <DisconnectIcon />
          <Text className="oui-text-base-contrast-80 oui-text-sm">
            {t("connector.disconnectWallet")}
          </Text>
        </Flex>
      )}
    </Box>
  );
};

const DisconnectIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M2.24219 5.24316C2.24219 3.58641 3.58536 2.24316 5.24219 2.24316H8.24219C9.89894 2.24316 11.2422 3.58641 11.2422 5.24316C11.2422 5.65716 10.9062 5.99316 10.4922 5.99316C10.0782 5.99316 9.74219 5.65716 9.74219 5.24316C9.74219 4.41441 9.07094 3.74316 8.24219 3.74316H5.24219C4.41374 3.74316 3.74219 4.41441 3.74219 5.24316V12.7432C3.74219 13.5719 4.41374 14.2432 5.24219 14.2432H8.24219C9.07094 14.2432 9.74219 13.5719 9.74219 12.7432C9.74219 12.3292 10.0782 11.9932 10.4922 11.9932C10.9062 11.9932 11.2422 12.3292 11.2422 12.7432C11.2422 14.3999 9.89894 15.7432 8.24219 15.7432H5.24219C3.58536 15.7432 2.24219 14.3999 2.24219 12.7432V5.24316ZM7.49219 8.99316C7.49219 8.57916 7.82819 8.24316 8.24219 8.24316H13.9144L12.4377 6.74316L13.4922 5.68866L16.2814 8.45391C16.5739 8.74716 16.5739 9.23915 16.2814 9.5324L13.4922 12.2977L12.4377 11.2432L13.9144 9.74316H8.24219C7.82819 9.74316 7.49219 9.40716 7.49219 8.99316Z"
        fill="white"
        fillOpacity="0.8"
      />
    </svg>
  );
};

const ActionButton: FC<{
  state: AccountStatusEnum;
  signIn: () => Promise<any>;
  enableTrading: () => Promise<any>;
  loading: boolean;
  showLedgerButton?: boolean;
  disabled?: boolean;
}> = ({
  state,
  signIn,
  enableTrading,
  loading,
  disabled,
  showLedgerButton,
}) => {
  const { t } = useTranslation();

  if (state <= AccountStatusEnum.NotSignedIn) {
    return (
      <Flex direction={"column"} gap={3} className="oui-w-full">
        <Button
          fullWidth
          onClick={() => signIn()}
          loading={loading}
          disabled={disabled}
        >
          {t("connector.createAccount")}
        </Button>
        {showLedgerButton && (
          <WithLedgerButton
            onClick={() => signIn()}
            content={t("connector.createAccountWithLedger")}
          />
        )}
      </Flex>
    );
  }

  return (
    <Flex direction={"column"} gap={3} className="oui-w-full">
      <Button
        fullWidth
        onClick={() => enableTrading()}
        loading={loading}
        disabled={disabled}
      >
        {t("connector.enableTrading")}
      </Button>
      {showLedgerButton && (
        <WithLedgerButton
          onClick={() => enableTrading()}
          disabled={disabled}
          content={t("connector.enableTradingWithLedger")}
        />
      )}
    </Flex>
  );

  // return (
  //   <Match
  //     value={() => {
  //       if (state <= AccountStatusEnum.NotSignedIn) {
  //         return "signIn";
  //       }
  //       return "enableTrading";
  //     }}
  //     case={{
  //       signIn: (
  //         <Flex direction={"column"} gap={3} className="oui-w-full">
  //           <Button
  //             fullWidth
  //             onClick={() => signIn()}
  //             loading={loading}
  //             disabled={disabled}
  //           >
  //             {t("connector.createAccount")}
  //           </Button>
  //           {showLedgerButton && (
  //             <WithLedgerButton
  //               onClick={() => signIn()}
  //               content={t("connector.createAccountWithLedger")}
  //             />
  //           )}
  //         </Flex>
  //       ),
  //       enableTrading: (
  //         <Flex direction={"column"} gap={3} className="oui-w-full">
  //           <Button
  //             fullWidth
  //             onClick={() => enableTrading()}
  //             loading={loading}
  //             disabled={disabled}
  //           >
  //             {t("connector.enableTrading")}
  //           </Button>
  //           {showLedgerButton && (
  //             <WithLedgerButton
  //               onClick={() => enableTrading()}
  //               disabled={disabled}
  //               content={t("connector.enableTradingWithLedger")}
  //             />
  //           )}
  //         </Flex>
  //       ),
  //     }}
  //   />
  // );
};

const WithLedgerButton = ({
  onClick,
  disabled,
  content,
}: {
  onClick: () => void;
  disabled?: boolean;
  content: ReactNode;
}) => {
  const { t } = useTranslation();
  const { state } = useAccount();
  const address = state.address;
  const { setLedgerAddress } = useStorageLedgerAddress();
  if (!address) {
    return null;
  }
  return (
    <Button
      variant="outlined"
      color="primary"
      fullWidth
      onClick={() => {
        setLedgerAddress(address);
        onClick();
      }}
      disabled={disabled}
      className="oui-w-full"
    >
      {content}
    </Button>
  );
};

const ReferralCode: FC<WalletConnectContentProps> = (props) => {
  const { t } = useTranslation();

  return (
    <TextField
      placeholder={t("connector.referralCode.placeholder")}
      fullWidth
      label=""
      value={props.refCode}
      onChange={(e) => {
        const _value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        props.setRefCode(_value);
      }}
      classNames={{
        label: "oui-text-base-contrast-54 oui-text-xs",
        input: "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
      }}
      formatters={[
        inputFormatter.createRegexInputFormatter((value: string | number) => {
          return String(value).replace(/[a-z]/g, (char: string) =>
            char.toUpperCase(),
          );
        }),
        inputFormatter.createRegexInputFormatter(/[^A-Z0-9]/g),
      ]}
      onClear={() => {
        props.setRefCode("");
      }}
      autoComplete="off"
      helpText={props.helpText}
      className="oui-mb-4"
      color={props.helpText ? "danger" : undefined}
    />
  );
};

const RememberMe = () => {
  const { t } = useTranslation();

  const showRememberHint = () => {
    if (window.innerWidth > 768) {
      return;
    }
    modal.alert({
      title: t("connector.rememberMe"),
      message: (
        <span className="oui-text-2xs oui-text-base-contrast/60">
          {t("connector.rememberMe.description")}
        </span>
      ),
    });
  };
  return (
    <Tooltip
      content={t("connector.rememberMe.description")}
      className="oui-max-w-[300px]"
    >
      <button onClick={showRememberHint}>
        <Text
          intensity={54}
          size={"xs"}
          className={
            "oui-underline oui-underline-offset-4 oui-decoration-dashed oui-decoration-base-contrast-36"
          }
        >
          {t("connector.rememberMe")}
        </Text>
      </button>
    </Tooltip>
  );
};

function paseErrorMsg(reject: any): string {
  console.log("wallet callback error", reject);
  console.log("message *** ", "reject keys", Object.keys(reject));
  Object.keys(reject).forEach((key) => {
    console.log("key", key, "-", reject[key]);
  });
  let msg = i18n.t("connector.somethingWentWrong");

  // if (typeof reject?.info?.error === "object" && "message" in reject?.info?.error) {
  //   msg = reject?.info?.error?.message;
  // }

  // if (typeof reject?.shortMessage === 'string') {
  //   msg = reject.shortMessage;
  // }

  if (reject.toString().includes("rejected")) {
    msg = i18n.t("connector.userRejected");
  }

  return capitalizeFirstLetter(msg) ?? msg;
}
