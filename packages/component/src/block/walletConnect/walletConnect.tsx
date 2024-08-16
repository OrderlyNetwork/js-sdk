import { Paper } from "@/layout";
import { ListTile } from "@/listView/listTile";
import { Switch } from "@/switch";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { StepItem } from "./sections/step";
import {
  useAccount,
  useCheckReferralCode,
  useGetReferralCode,
  useMutation,
} from "@orderly.network/hooks";
import Button from "@/button";
import { toast } from "@/toast";
import { RememberMe } from "./sections/rememberMe";
import { ReferralCode } from "./sections/referralCode";
import { OrderlyAppContext } from "@/provider";

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
    account,
    state: { status, isNew },
  } = useAccount();

  const [handleStep, setHandleStep] = useState(0);
  const [remember, setRemember] = useState(true);
  const localRefCode = localStorage.getItem("referral_code") || undefined;
  const [refCode, setRefCode] = useState<string | undefined>(localRefCode);
  const [bindRefCode, { error: updateOrderError, isMutating: updateMutating }] =
    useMutation("/v1/referral/bind", "POST");

  const { referral } = useContext(OrderlyAppContext);
  const { isExist } = useCheckReferralCode(refCode);

  const { referral_code, isLoading: loadingReferralCode } = useGetReferralCode(
    account?.accountId
  );

  const buttonLabel = useMemo(() => {
    if (status < AccountStatusEnum.SignedIn) {
      return "Sign in";
    }
    if (status < AccountStatusEnum.EnableTrading) {
      return "Enable Trading";
    }
    return "--";
  }, [status]);

  const enableTrading = useCallback(() => {
    setHandleStep(2);
    return props
      .onEnableTrading?.(remember)
      .then(
        () => {
          if (refCode && refCode.length > 0) {
            bindRefCode({ referral_code: refCode })
              .then((res) => {
                referral?.onBoundRefCode?.(true, undefined);
              })
              .catch((e) => {
                referral?.onBoundRefCode?.(false, e);
              })
              .finally(() => {
                localStorage.removeItem("referral_code");
              });
          }
          props.onComplete?.();
        },
        (e) => {
          let errorText = `${e}`;
          if ("message" in e) {
            errorText = e.message;
          }

          if (errorText.includes("User rejected the request.")) {
            errorText = "User rejected the request.";
          }
          if ("referral code not exist" === errorText) {
            errorText = "This referral code does not exist";
          }
          toast.error(errorText);
        }
      )
      .finally(() => {
        setHandleStep(0);
      });
  }, [refCode]);

  const onClick = useCallback(() => {
    if (status < AccountStatusEnum.SignedIn) {
      setHandleStep(1);
      return props.onSignIn?.().finally(() => {
        setHandleStep(0);
        // sign in success then auto enable trading
        enableTrading();
      });
    }
    if (status < AccountStatusEnum.EnableTrading) {
      return enableTrading();
    }
  }, [status, remember, refCode]);

  const isExpired = status === AccountStatusEnum.DisabledTrading && !isNew;

  return (
    <div id="orderly-wallet-connect-view">
      <div className="orderly-text-base-contrast-54 orderly-text-2xs orderly-py-4 desktop:orderly-text-base">
        {isExpired
          ? "Your previous access has expired, you will receive a signature request to enable trading. Signing is free and will not send a transaction."
          : "Sign two requests to verify ownership of your wallet and enable trading. Signing is free."}
      </div>

      <Paper className="orderly-bg-base-500">
        {!isExpired && (
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
        )}
        <ListTile
          className="orderly-text-xs desktop:orderly-text-base"
          disabled={status < AccountStatusEnum.SignedIn}
          avatar={
            <StepItem
              active={status >= AccountStatusEnum.SignedIn}
              isLoading={handleStep === 2}
              isCompleted={status >= AccountStatusEnum.EnableTrading}
            >
              {isExpired ? 1 : 2}
            </StepItem>
          }
          title="Enable Trading"
          subtitle="Enable secure access to our API for lightning-fast trading"
        />
      </Paper>

      {(referral_code?.length || 0) === 0 && loadingReferralCode === false && (
        <ReferralCode
          className="orderly-pt-5"
          refCode={refCode}
          setRefCode={setRefCode}
          isExist={isExist}
        />
      )}

      <div className="orderly-py-4 orderly-flex orderly-justify-between orderly-items-center">
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
          id="orderly-wallet-connector-button"
          className="orderly-text-xs orderly-text-base-contrast"
          fullWidth
          disabled={
            handleStep > 0 || (isExist !== true && (refCode?.length || 0) > 0)
          }
          onClick={onClick}
          loading={handleStep > 0}
        >
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};
