import { FC, PropsWithChildren, ReactNode, useContext } from "react";
import { Button } from "@/button/button";
import { useAccount, OrderlyContext } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

export interface ConnectGuardButtonProps {
  placeholder?: ReactNode;
  connected?: boolean;
  onConnectWallet?: () => void;
}

export const ConnectGuardButton: FC<
  PropsWithChildren<ConnectGuardButtonProps>
> = (props) => {
  const { state } = useAccount();

  const { onWalletConnect } = useContext(OrderlyContext);

  if (state.status === AccountStatusEnum.NotConnected) {
    if (typeof props.placeholder === "undefined") {
      return (
        <Button type="button" fullWidth onClick={() => onWalletConnect?.()}>
          Connect Wallet
        </Button>
      );
    }
    return <>{props.placeholder}</>;
  }
  return <>{props.children}</>;
};
