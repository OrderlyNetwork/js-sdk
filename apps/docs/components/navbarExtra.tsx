import { useMemo } from "react";
import { ConnectButton } from "./connectButton";
import { useAccount } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";

const reg = new RegExp(`^(.{${4}})(.*)(.{${4}})$`);

export const NavbarExtra = () => {
  const { state } = useAccount();
  const walletButton = useMemo(() => {
    if (state.status === AccountStatusEnum.NotConnected) {
      return <ConnectButton />;
    }
    return (
      <div className="border p-2 rounded">
        {state.address!.replace(reg, "$1...$3")}
      </div>
    );
  }, [state.status]);

  return <div>{walletButton}</div>;
};
