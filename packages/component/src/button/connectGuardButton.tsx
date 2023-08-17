import { FC, PropsWithChildren, ReactNode } from "react";
import { Button } from "@/button/button";

export interface ConnectGuardButtonProps {
  placeholder?: ReactNode;
  connected?: boolean;
  onConnectWallet?: () => void;
}

export const ConnectGuardButton: FC<
  PropsWithChildren<ConnectGuardButtonProps>
> = (props) => {
  const { connected } = props;

  if (!connected) {
    if (typeof props.placeholder === "undefined") {
      return (
        <Button fullWidth onClick={() => props.onConnectWallet?.()}>
          Connect Wallet
        </Button>
      );
    }
    return <>{props.placeholder}</>;
  }
  return <>{props.children}</>;
};
