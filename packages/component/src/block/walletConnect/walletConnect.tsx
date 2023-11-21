import { Paper } from "@/layout";
import { ListTile } from "@/listView/listTile";
import { Switch } from "@/switch";
import { Info } from "lucide-react";
import { FC, useCallback, useContext, useMemo, useState } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { StepItem } from "./sections/step";
import { create, register } from "@/modal/modalHelper";
import { useAccount, OrderlyContext } from "@orderly.network/hooks";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/sheet";
import { useModal } from "@/modal";
import Button from "@/button";
import { toast } from "@/toast";
import { Logo } from "@/logo";
import { modal } from "@/modal";
import { InfoIcon } from "@/icon";

interface WalletConnectProps {
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
  }, [status, remember]);

  const showRememberHint = () => {
    modal.alert({
      title: "Remember me",
      message: (
        <span className="text-3xs text-base-contrast/60">
          Toggle this option to skip these steps next time you want to trade.
        </span>
      ),
    });
  };

  return (
    <div>
      <div className="text-base-contrast-54 text-2xs py-4">
        Sign two requests to verify ownership of your wallet and enable trading.
        Signing is free.
      </div>

      <Paper className="bg-base-300">
        <ListTile
          className="text-xs"
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
          className="text-xs"
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

      <div className="pt-5 pb-7 flex justify-between items-center ">
        <div
          className="text-base-contrast-54 text-xs"
          onClick={showRememberHint}
        >
          <span>Remember me</span>
          <InfoIcon className="inline-block ml-2" size={14} />
        </div>
        <div>
          <Switch checked={remember} onCheckedChange={setRemember} />
        </div>
      </div>
      <div>
        <Button
          className="text-xs text-base-contrast"
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

export const WalletConnectSheet = create<WalletConnectProps>((props) => {
  const { visible, hide, resolve, reject, onOpenChange } = useModal();
  // get account status and handle sign in and enable trading
  const { account, createOrderlyKey, createAccount } = useAccount();
  // @ts-ignore
  const { logoUrl } = useContext(OrderlyContext);

  const onSignIn = useCallback(() => {
    return createAccount().catch((err: Error) => {
      reject();
      toast.error(err.message);
      hide();
    });
  }, [account]);

  const onComplete = useCallback(() => {
    toast.success("Wallet connected");
    resolve();
    hide();
  }, []);

  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader leading={<Logo image={logoUrl} />}>
          <SheetTitle>Connect wallet</SheetTitle>
        </SheetHeader>
        <WalletConnect
          onEnableTrading={createOrderlyKey}
          onSignIn={onSignIn}
          onComplete={onComplete}
          {...props}
        />
      </SheetContent>
    </Sheet>
  );
});

// register("walletConnect", WalletConnectSheet);
