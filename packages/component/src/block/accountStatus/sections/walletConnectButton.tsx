import { FC, useContext, useMemo } from "react";
import Button from "@/button";
import { Text } from "@/text";
import { AccountStatusEnum } from "@orderly.network/types";
import { Sheet } from "lucide-react";
import { SheetContent, SheetHeader, SheetTrigger } from "@/sheet";
import { OrderlyAppContext } from "@/provider";
import { cn } from "@/utils/css";

interface Props {
  status: AccountStatusEnum;
  address?: string;
  loading?: boolean;
  onConnect?: () => void;
  onShowAccount?: () => void;
  className?: string;
}

export const WalletConnectButton: FC<Props> = (props) => {
  const { status = AccountStatusEnum.NotConnected, address } = props;
  const { errors } = useContext(OrderlyAppContext);

  const buttonLabel = useMemo(() => {
    switch (status) {
      case AccountStatusEnum.NotConnected:
        return "Connect wallet";
      case AccountStatusEnum.Connected:
      case AccountStatusEnum.NotSignedIn:
      case AccountStatusEnum.SignedIn:
      case AccountStatusEnum.DisabledTrading:
      case AccountStatusEnum.EnableTrading:
        return (
          <Text rule="address" range={[4, 4]}>
            {props.address}
          </Text>
        );
    }
  }, [status, address]);

  if (status === AccountStatusEnum.NotConnected) {
    return (
      <Button
        id="orderly-top-nav-bar-not-connect"
        size={"small"}
        loading={props.loading}
        // variant={"gradient"}
        className={cn(
          "orderly-bg-primary orderly-text-base-contrast orderly-text-4xs hover:orderly-text-base-80 orderly-h-[30px]",
          props.className
        )}
        onClick={() => props.onConnect?.()}
      >
        {buttonLabel}
      </Button>
    );
  }

  return (
    <Button
      id="orderly-bottom-nav-bar-connect-button"
      size={"small"}
      // variant={"gradient"}
      className={cn(
        "orderly-bg-primary orderly-text-base-contrast orderly-text-4xs hover:orderly-text-base-80 orderly-h-[30px]",
        props.className
      )}
      loading={props.loading}
      disabled={props.loading}
    >
      {buttonLabel}
    </Button>
  );
};
