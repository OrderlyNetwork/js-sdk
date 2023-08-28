import { Paper } from "@/layout";
import { ListTile } from "@/listView/listTile";
import { Switch } from "@/switch";
import { Info } from "lucide-react";
import { FC, useMemo } from "react";
import { AccountStatusEnum } from "@orderly.network/core";
import { StepItem } from "./sections/step";
import { create, register } from "@/modal/modalHelper";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/sheet";
import { useModal } from "@/modal";
import Button from "@/button";

interface WalletConnectProps {
  onSignIn?: () => void;
  onEnableTrading?: () => void;
  //   status?: "loggedIn" | "enabledTrading";
  status: AccountStatusEnum;

  loading?: boolean;
}

export const WalletConnect: FC<WalletConnectProps> = (props) => {
  const { status = AccountStatusEnum.NotConnected } = props;

  const buttonLabel = useMemo(() => {
    if (status < AccountStatusEnum.SignedIn) {
      return "Sign In";
    }
    if (status < AccountStatusEnum.EnabledTrading) {
      return "Enable Trading";
    }
    return "";
  }, [status]);

  return (
    <div>
      <div className="text-base-contrast/50 py-4">
        You will receive two signature requests to verify your ownership and
        enable trading. Signing is free and will not send a transaction.
      </div>

      <Paper>
        <ListTile
          avatar={<StepItem active={status > 3}>1</StepItem>}
          title="Sign In"
          disabled={status < 1}
          subtitle="Confirm you are the owner of this wallet"
        />
        <ListTile
          disabled={status < 3}
          avatar={<StepItem active={status > 4}>2</StepItem>}
          onClick={() => {
            props.onEnableTrading?.();
          }}
          title="Enable Trading"
          subtitle="Enable secure access to our API for lightning fast trading"
        />
      </Paper>

      <div className="pt-5 pb-7 flex justify-between items-center ">
        <div className="text-base-contrast/50">
          <span>Remember me</span>
          <Info className="inline-block ml-2" size={16} />
        </div>
        <Switch />
      </div>
      <div>
        <Button fullWidth disabled={props.loading}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
};

export const WalletConnectSheet = create<WalletConnectProps>((props) => {
  const { visible, hide, onOpenChange } = useModal();
  return (
    <Sheet open={visible} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Connect Wallet</SheetTitle>
        </SheetHeader>
        <WalletConnect {...props} />
        {/* <SheetFooter>
          <Button>Sign In</Button>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
});

register("walletConnect", WalletConnectSheet);
