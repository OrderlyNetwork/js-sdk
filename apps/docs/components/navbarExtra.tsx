import { useMemo } from "react";
import { ConnectButton } from "./connectButton";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

export const NavbarExtra = () => {
  const { state } = useAccount();
  const walletButton = useMemo(() => {
    if (state.status === AccountStatusEnum.NotConnected) {
      return <ConnectButton />;
    }
    return <div>Connected</div>;
  }, [state.status]);

  return <div>{walletButton}</div>;
};
