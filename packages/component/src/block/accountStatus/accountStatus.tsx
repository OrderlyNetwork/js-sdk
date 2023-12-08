import { FC } from "react";
import { WalletConnectButton } from "./sections/walletConnectButton";
import { AccountStatusProps } from "./accountStatusBar";
import { AccountStatusEnum } from "@orderly.network/types";
import { Chains } from "./sections/chains";
import { cn } from "@/utils/css";

export const AccountStatus: FC<AccountStatusProps & { className?: string }> = (
  props
) => {
  const { status = AccountStatusEnum.NotConnected } = props;
  return (
    <div
      className={cn(
        "orderly-h-full orderly-flex orderly-items-center orderly-space-x-2",
        props.className
      )}
    >
      <Chains
        disabled={status < AccountStatusEnum.NotConnected}
        className="orderly-rounded-full"
      />
      <WalletConnectButton
        status={status}
        address={props.address}
        className="orderly-rounded-full"
      />
    </div>
  );
};
