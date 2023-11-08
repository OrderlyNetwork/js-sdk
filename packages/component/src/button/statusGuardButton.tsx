import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Button } from "@/button/button";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { modal } from "@/modal";
import { WalletConnectSheet } from "@/block/walletConnect";
import { OrderlyAppContext } from "@/provider";

export interface ConnectGuardButtonProps {
  placeholder?: ReactNode;
  connected?: boolean;
  // onConnectWallet?: () => void;
}

export const StatusGuardButton: FC<
  PropsWithChildren<ConnectGuardButtonProps>
> = (props) => {
  const { state, connect } = useAccount();
  const { onWalletConnect } = useContext(OrderlyAppContext);

  const onClick = useCallback(async () => {
    if (state.status === AccountStatusEnum.NotConnected) {
      try {
        const result = await onWalletConnect();

        if (result && result.status < AccountStatusEnum.EnableTrading) {
          return await modal.show(WalletConnectSheet, {
            status: result.status,
          });
        } else {
          return result;
        }
      } catch (e) {}
    }

    if (state.status < AccountStatusEnum.EnableTrading) {
      try {
        return await modal.show(WalletConnectSheet, {
          status: state.status,
        });
      } catch (err) {}
    }
  }, [connect, state]);

  const buttonLabel = useMemo(() => {
    if (state.status === AccountStatusEnum.NotConnected) {
      return "Connect wallet";
    }

    if (state.status < AccountStatusEnum.SignedIn) {
      return "Sign in";
    }

    if (state.status < AccountStatusEnum.EnableTrading) {
      return "Enable Trading";
    }

    return "-";
  }, [state.status]);

  if (state.status < AccountStatusEnum.EnableTrading) {
    if (typeof props.placeholder === "undefined") {
      return (
        <Button type="button" fullWidth onClick={() => onClick()}>
          {buttonLabel}
        </Button>
      );
    }
    return <>{props.placeholder}</>;
  }
  return <>{props.children}</>;
};
