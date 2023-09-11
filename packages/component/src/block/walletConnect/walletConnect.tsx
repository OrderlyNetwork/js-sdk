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
      return "Sign In";
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
        .then(() => {
          props.onComplete?.();
        })
        .finally(() => {
          setHandleStep(0);
        });
    }
  }, [status, remember]);

  return (
    <div>
      <div className="text-base-contrast/50 py-4">
        You will receive two signature requests to verify your ownership and
        enable trading. Signing is free and will not send a transaction.
      </div>

      <Paper className="bg-base-100">
        <ListTile
          avatar={
            <StepItem
              active={status <= AccountStatusEnum.NotSignedIn}
              isLoading={handleStep === 1}
              isCompleted={status >= AccountStatusEnum.SignedIn}
            >
              1
            </StepItem>
          }
          title="Sign In"
          disabled={
            status < AccountStatusEnum.NotConnected ||
            status >= AccountStatusEnum.SignedIn
          }
          subtitle="Confirm you are the owner of this wallet"
        />
        <ListTile
          disabled={status < AccountStatusEnum.SignedIn}
          avatar={
            <StepItem
              active={status > AccountStatusEnum.SignedIn}
              isLoading={handleStep === 2}
              isCompleted={status >= AccountStatusEnum.EnableTrading}
            >
              2
            </StepItem>
          }
          title="Enable Trading"
          subtitle="Enable secure access to our API for lightning fast trading"
        />
      </Paper>

      <div className="pt-5 pb-7 flex justify-between items-center ">
        <div className="text-base-contrast/50">
          <span>Remember me</span>
          <Info className="inline-block ml-2" size={16} />
        </div>
        <Switch checked={remember} onCheckedChange={setRemember} />
      </div>
      <div>
        <Button
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
  const { logoUrl } = useContext(OrderlyContext);

  // const onEnableTrading = useCallback(
  //   (remember: boolean) => {
  //     return account.createOrderlyKey(remember ? 365 : 30);
  //   },
  //   [account]
  // );

  const onSignIn = useCallback(() => {
    return createAccount().catch((err: Error) => {
      // console.log("!!!!!!!!!!!!!!!!!", err);
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
          <SheetTitle>Connect Wallet</SheetTitle>
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
