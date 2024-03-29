import { Paper } from "@/layout";
import { ListTile } from "@/listView/listTile";
import { Switch } from "@/switch";
import { FC, useCallback, useMemo, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { StepItem } from "./sections/step";
import { useAccount, useMutation } from "@orderly.network/hooks";

import Button from "@/button";
import { toast } from "@/toast";
import { RememberMe } from "./sections/rememberMe";
import { ReferralCode } from "./sections/referralCode";

export interface WalletConnectProps {
  onSignIn?: () => Promise<any>;
  onEnableTrading?: (remember: boolean) => Promise<any>;
  onComplete?: () => void;
  //   status?: "loggedIn" | "enabledTrading";
  status: AccountStatusEnum;

  loading?: boolean;
}

export const WalletConnect: FC<WalletConnectProps> = (props) => {
  // const { status = AccountStatusEnum.NotConnected } = props;
  const {
    state: { status },
  } = useAccount();

  const [handleStep, setHandleStep] = useState(0);
  const [remember, setRemember] = useState(true);
  const localRefCode = localStorage.getItem("referral_code") || undefined;
  const [refCode, setRefCode] = useState<string | undefined>(localRefCode);
  const [
    bindRefCode,
    { error: updateOrderError, isMutating: updateMutating },
  ] = useMutation("/v1/referral/bind", "POST");

  const buttonLabel = useMemo(() => {
    if (status < AccountStatusEnum.SignedIn) {
      return "Sign in";
    }
    if (status < AccountStatusEnum.EnableTrading) {
      return "Enable Trading";
    }
    return "--";
  }, [status]);

  const onClick = useCallback(() => {
    if (status < AccountStatusEnum.SignedIn) {
      setHandleStep(1);
      return props.onSignIn?.().finally(() => {
        setHandleStep(0);
      });
    }
    if (status < AccountStatusEnum.EnableTrading) {
      setHandleStep(2);
      return props
        .onEnableTrading?.(remember)
        .then(
          () => {
            if (refCode && refCode.length > 0) {
              bindRefCode({referral_code: refCode}).catch((e) => {}).finally(() => {
                localStorage.removeItem("referral_code");
              });
            }
            props.onComplete?.();
          },
          (error) => {
            toast.error(error.message);
          }
        )
        .finally(() => {
          setHandleStep(0);
        });
    }
  }, [status, remember, refCode]);

  return (
    <div>
      <div className="orderly-text-base-contrast-54 orderly-text-2xs orderly-py-4 desktop:orderly-text-base">
        Sign two requests to verify ownership of your wallet and enable trading.
        Signing is free.
      </div>

      <Paper className="orderly-bg-base-500">
        <ListTile
          className="orderly-text-xs desktop:orderly-text-base"
          avatar={
            <StepItem
              active={status <= AccountStatusEnum.NotSignedIn}
              isLoading={handleStep === 1}
              isCompleted={status >= AccountStatusEnum.SignedIn}
            >
              1
            </StepItem>
          }
          title="Sign in"
          disabled={
            status < AccountStatusEnum.NotConnected ||
            status >= AccountStatusEnum.SignedIn
          }
          subtitle="Confirm you own this wallet"
        />
        <ListTile
          className="orderly-text-xs desktop:orderly-text-base"
          disabled={status < AccountStatusEnum.SignedIn}
          avatar={
            <StepItem
              active={status >= AccountStatusEnum.SignedIn}
              isLoading={handleStep === 2}
              isCompleted={status >= AccountStatusEnum.EnableTrading}
            >
              2
            </StepItem>
          }
          title="Enable Trading"
          subtitle="Enable secure access to our API for lightning-fast trading"
        />
      </Paper>

      <ReferralCode className="orderly-pt-5" refCode={refCode} setRefCode={setRefCode} />
      <div className="orderly-pt-5 orderly-pb-7 orderly-flex orderly-justify-between orderly-items-center">
        <RememberMe />
        <div>
          <Switch
            id="orderly-remember-me-switch"
            checked={remember}
            onCheckedChange={setRemember}
          />
        </div>
      </div>
      <div>
        <Button
          className="orderly-text-xs orderly-text-base-contrast"
          fullWidth
          disabled={handleStep > 0}
          onClick={onClick}
          loading={handleStep > 0}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
