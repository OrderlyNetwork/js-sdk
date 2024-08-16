import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { Button } from "@/button/button";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import { OrderlyAppContext } from "@/provider";
import { showAccountConnectorModal } from "@/block/walletConnect/walletModal";
import { cn } from "@/utils";

export interface ConnectGuardButtonProps {
  placeholder?: ReactNode;
  connected?: boolean;
  // onConnectWallet?: () => void;
  id?: {
    connectWallet?: string;
    signIn?: string;
    enableTrading?: string;
    normal?: string;
  };
  className?: string;
}

export const StatusGuardButton: FC<
  PropsWithChildren<ConnectGuardButtonProps>
> = (props) => {
  const { state } = useAccount();
  const { onWalletConnect } = useContext(OrderlyAppContext);
  const { connect } = useWalletConnector();

  const onClick = useCallback(async () => {
    if (state.status === AccountStatusEnum.NotConnected) {
      try {
        return await connect();
        // const result = await onWalletConnect();

        // if (result && result.status < AccountStatusEnum.EnableTrading) {
        //   return await showAccountConnectorModal({
        //     status: result.status,
        //   });
        // } else {
        //   return result;
        // }
      } catch (e) {}
    } else if (state.status < AccountStatusEnum.EnableTrading) {
      try {
        return await showAccountConnectorModal({
          status: state.status,
        });
      } catch (err) {}
    }
  }, [state]);

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
  
  
  const buttonId = useMemo(() => {
    if (state.status === AccountStatusEnum.NotConnected) {
      return props.id?.connectWallet;
    }

    if (state.status < AccountStatusEnum.SignedIn) {
      return props.id?.signIn;
    }

    if (state.status < AccountStatusEnum.EnableTrading) {
      return props.id?.enableTrading;
    }

    return props.id?.normal;
  }, [props.id]);

  if (state.status < AccountStatusEnum.EnableTrading) {
    if (typeof props.placeholder === "undefined") {
      return (
        <Button
          id={buttonId}
          type="button"
          fullWidth
          onClick={() => onClick()}
          className={cn("desktop:orderly-font-bold desktop:orderly-text-sm", props.className)}
        >
          {buttonLabel}
        </Button>
      );
    }
    return <>{props.placeholder}</>;
  }
  return <>{props.children}</>;
};
