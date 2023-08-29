import Button from "@/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";

import { AccountInfo } from "./sections/accountInfo";
import React, { FC, useMemo } from "react";

import { Text } from "@/text";
import { NetworkImage } from "@/icon";
import { ChevronDown } from "lucide-react";
import { AccountTotal } from "./sections/accountTotal";

export type AccountStatus =
  | "NotConnected"
  | "Connected"
  | "NotSignedIn"
  | "EnabledTrading"
  | "SignedIn";

interface AccountStatusProps {
  className?: string;
  status: AccountStatus;
  chains: string[];
  address?: string;
  balance?: string;
  currency?: string;

  loading?: boolean;

  onConnect?: () => void;
  onDisconnect?: () => void;
  // onConnected?: () => void;
}

export const AccountStatusBar: FC<AccountStatusProps> = (props) => {
  const { status = "NotConnected" } = props;

  const buttonLabel = useMemo(() => {
    switch (status) {
      case "NotConnected":
        return "Connect Wallet";
      case "Connected":

      case "NotSignedIn":

      case "SignedIn":
        return (
          <Text rule="address" range={[4, 4]}>
            {props.address}
          </Text>
        );
    }
  }, [status, props.address]);

  return (
    <div className="flex items-center justify-between h-[44px]">
      {status !== "NotConnected" ? (
        <AccountTotal
          status={status}
          currency={props.currency}
          balance={props.balance}
        />
      ) : (
        <div />
      )}

      <div className="flex gap-2">
        <Button
          variant={"outlined"}
          size={"small"}
          color={"buy"}
          className={"border-[rgba(38,254,254,1)]"}
        >
          <NetworkImage id={1} type="chain" size={"small"} />
          <ChevronDown size={16} className="ml-2" />
        </Button>
        {status === "NotConnected" ? (
          <Button
            size={"small"}
            loading={props.loading}
            variant={"gradient"}
            className="bg-gradient-to-r from-[#26FEFE] to-[#59B0FE]"
            onClick={() => props.onConnect?.()}
          >
            {buttonLabel}
          </Button>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size={"small"}
                variant={"gradient"}
                className="bg-gradient-to-r from-[#26FEFE] to-[#59B0FE] text-base-100"
                loading={props.loading}
              >
                {buttonLabel}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>My account</SheetHeader>
              <AccountInfo onDisconnect={props.onDisconnect} />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};
