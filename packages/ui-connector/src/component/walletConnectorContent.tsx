import { FC, useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useEventEmitter,
  useLocalStorage,
} from "@orderly.network/hooks";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  Box,
  Button,
  capitalizeFirstLetter,
  Divider,
  Flex,
  inputFormatter,
  Match,
  modal,
  Switch,
  Text,
  TextField,
  toast,
  Tooltip,
} from "@orderly.network/ui";
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

  const { state: accountState, account } = useAccount();
  const [state, setState] = useState(initAccountState);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
        title: t("connector.signIn"),
        description: t("connector.signIn.description"),
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

  const onEnableTrading = () => {
    setLoading(true);
    return props
      .enableTrading(remember)
      .then(
        async (res) => {
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
          if (reject === -1) return;

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

          if (reject === -1) return;
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
          return (
            <StepItem
              title={step.title}
              description={step.description}
              isCompleted={activeStep > index}
              key={step.key}
              active={activeStep === index}
              isLoading={loading && activeStep === index}
            />
          );
        })}
        {steps.length > 1 && (
          <Box
            position={"absolute"}
            height={"38px"}
            left={28}
            top={18}
            zIndex={0}
          >
            <Divider
              lineStyle={"dashed"}
              direction={"vertical"}
              intensity={16}
              className="oui-h-full"
            />
          </Box>
        )}
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
      <Flex justify={"center"} mt={8}>
        <Box className="oui-min-w-[144px]">
          <ActionButton
            state={state}
            signIn={onSignIn}
            enableTrading={onEnableTrading}
            loading={loading}
            disabled={state >= AccountStatusEnum.EnableTrading}
          />
        </Box>
      </Flex>
    </Box>
  );
};

const ActionButton: FC<{
  state: AccountStatusEnum;
  signIn: () => Promise<any>;
  enableTrading: () => Promise<any>;
  loading: boolean;
  disabled?: boolean;
}> = ({ state, signIn, enableTrading, loading, disabled }) => {
  const { t } = useTranslation();

  return (
    <Match
      value={() => {
        if (state <= AccountStatusEnum.NotSignedIn) {
          return "signIn";
        }
        return "enableTrading";
      }}
      case={{
        signIn: (
          <Button
            fullWidth
            onClick={() => signIn()}
            loading={loading}
            disabled={disabled}
          >
            {t("connector.signIn")}
          </Button>
        ),
        enableTrading: (
          <Button
            fullWidth
            onClick={() => enableTrading()}
            loading={loading}
            disabled={disabled}
          >
            {t("connector.enableTrading")}
          </Button>
        ),
      }}
    />
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
    if (window.innerWidth > 768) return;
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
