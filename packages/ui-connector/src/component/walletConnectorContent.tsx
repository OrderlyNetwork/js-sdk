import { FC, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Flex,
  Match,
  Switch,
  Text,
} from "@orderly.network/ui";
import { AccountStatusEnum } from "@orderly.network/types";
import { StepItem } from "./step";

export type WalletConnectContentProps = {
  initAccountState: AccountStatusEnum;
  signIn: () => Promise<any>;
  enableTrading: (remember: boolean) => Promise<any>;
  onCompleted?: () => void;
  close?: () => void;
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
    return props.enableTrading(remember).then((res) => {
      console.log(res);
      setLoading(false);
      setActiveStep((step) => step + 1);
      if (typeof props.onCompleted === "function") {
        props.onCompleted();
      } else if (typeof props.close === "function") {
        props.close();
      }
      // props.onCompleted?.();
    });
  };

  const onSignIn = () => {
    setLoading(true);
    return props.signIn().then((res) => {
      setActiveStep((step) => step + 1);
      return onEnableTrading();
    });
  };

  return (
    <Box>
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
            left={27}
            top={18}
            zIndex={0}
          >
            <Divider
              lineStyle={"dashed"}
              direction={"vertical"}
              intensity={5}
            />
          </Box>
        )}
      </Box>
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
