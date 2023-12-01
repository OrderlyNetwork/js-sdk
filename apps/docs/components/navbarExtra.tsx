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
      <div className="border border-base-400 px-2 rounded h-[35px] flex items-center text-base-contrast-80">
        <img
          src="https://oss.woo.network/static/wallet_icon/metamask.png"
          alt="metamask"
          className="w-[20px] h-[20px] mr-1"
        />
        <span>{state.address!.replace(reg, "$1...$3")}</span>
      </div>
    );
  }, [state.status]);

  return <div>{walletButton}</div>;
};
