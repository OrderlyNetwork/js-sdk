import { FC, useMemo, useState } from "react";
import {
  Box,
  Button,
  cn,
  Divider,
  Flex,
  Input,
  inputFormatter,
  Match,
  Switch,
  Text,
  TextField,
  toast,
} from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
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

  const [state, setState] = useState(initAccountState);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

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
          console.log("enable trading reject", reject);
          setLoading(false);
          if (reject === -1) return;
          toast.error("User rejected the request");
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
          return onEnableTrading();
        },
        (reject) => {
          toast.error("User rejected the request");
          setLoading(false);
        }
      )
      .catch((e) => {
        setLoading(false);
      });
  };

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
            left={30}
            top={20}
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
      {props.showRefCodeInput && <ReferralCode {...props} />}
      <Flex justify={"between"} itemAlign={"center"}>
        <Text
          intensity={54}
          size={"xs"}
          className={
            "oui-underline oui-underline-offset-4 oui-decoration-dashed oui-decoration-base-contrast-36"
          }
        >
          Remember me
        </Text>
        <Switch
          color={"primary"}
          checked={remember}
          onCheckedChange={setRemember}
          disabled={loading}
          className="data-[state=checked]:oui-bg-[#3347FD]"
        />
      </Flex>
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
        if (state < AccountStatusEnum.SignedIn) {
          return "signIn";
        }
        return "enableTrading";
      }}
      case={{
        signIn: (
          <Button fullWidth onClick={() => signIn()} loading={loading}>
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
      placeholder="Referral code"
      fullWidth
      label={"Referral code (optional)"}
      value={props.refCode}
      onChange={(e) => {
        props.setRefCode(e.target.value);
      }}
      classNames={{
        label: "oui-text-base-contrast-54 oui-text-xs",
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
