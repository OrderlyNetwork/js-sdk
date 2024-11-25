import { FC, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  capitalizeFirstLetter,
  cn,
  Divider,
  Flex,
  Input,
  inputFormatter,
  Match,
  modal,
  Switch,
  Text,
  TextField,
  toast,
  Tooltip,
} from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { StepItem } from "./step";
import { useAccount, useLocalStorage } from "@orderly.network/hooks";

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

  const { state: accountState } = useAccount();
  const [state, setState] = useState(initAccountState);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [firstShowDialog] = useLocalStorage(
    "orderly-first-show-wallet-connector-dialog",
    undefined
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
        title: "Sign In",
        description: "Confirm you are the owner of this wallet",
      });
    }

    if (initAccountState < AccountStatusEnum.EnableTrading) {
      steps.push({
        key: "enableTrading",
        title: "Enable Trading",
        description:
          "Enable secure access to our API for lightning fast trading",
      });
    }

    return steps;
  }, []);

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
          toast.error(paseErrorMsg(reject));
        }
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
          toast.error(paseErrorMsg(reject));
        }
      )
      .catch((e) => {
        setLoading(false);
      });
  };

  console.log("state", state);

  return (
    <Box id="oui-wallet-connect-dialog-content" className="oui-font-semibold">
      <Text intensity={54} size="xs">
        Your previous access has expired, you will receive a signature request
        to enable trading. Signing is free and will not send a transaction.
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
            className="data-[state=checked]:oui-bg-[#3347FD]"
          />
        </Flex>
      )}
      <Flex justify={"center"} mt={8}>
        <Box width={"45%"}>
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
            Sign In
          </Button>
        ),
        enableTrading: (
          <Button
            fullWidth
            onClick={() => enableTrading()}
            loading={loading}
            disabled={disabled}
          >
            Enable Trading
          </Button>
        ),
      }}
    />
  );
};

const ReferralCode: FC<WalletConnectContentProps> = (props) => {
  return (
    <TextField
      placeholder="Referral code (Optional)"
      fullWidth
      // label={"Referral code (optional)"}
      label=""
      value={props.refCode}
      onChange={(e) => {
        props.setRefCode(e.target.value);
      }}
      classNames={{
        label: "oui-text-base-contrast-54 oui-text-xs",
        input: "placeholder:oui-text-base-contrast-20 placeholder:oui-text-sm",
      }}
      formatters={[inputFormatter.createRegexInputFormatter(/[^A-Z0-9]/g)]}
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
  const showRememberHint = () => {
    if (window.innerWidth > 768) return;
    modal.alert({
      title: "Remember me",
      message: (
        <span className="oui-text-2xs oui-text-base-contrast/60">
          Toggle this option to skip these steps next time you want to trade.
        </span>
      ),
    });
  };
  return (
    <Tooltip
      content={
        "Toggle this option to skip these steps next time you want to trade."
      }
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
          Remember me
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
  let msg = "Something when wrong";

  if (typeof reject?.info?.error === "object" && "message" in reject?.info?.error) {
    msg = reject?.info?.error?.message;
  }

  if (typeof reject?.shortMessage === 'string') {
    msg = reject.shortMessage;
  }

  if (msg.includes("rejected")) {
    msg = "User rejected the request.";
  }

  return capitalizeFirstLetter(msg) ?? msg;
}