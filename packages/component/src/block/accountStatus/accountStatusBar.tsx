import React, { FC, useContext, useMemo, useState } from "react";
import Button from "@/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/sheet";

import { AccountInfo } from "./sections/accountInfo";

import { Text } from "@/text";
import { NetworkImage } from "@/icon";
import { ChevronDown } from "lucide-react";
import { AccountTotal } from "./sections/accountTotal";
import { AccountStatusEnum } from "@orderly.network/types";
import { Logo } from "@/logo";
import { OrderlyContext, useChains } from "@orderly.network/hooks";
import { Chains } from "./sections/chains";

export type AccountStatus =
  | "NotConnected"
  | "Connected"
  | "NotSignedIn"
  | "EnabledTrading"
  | "SignedIn";

interface AccountStatusProps {
  className?: string;
  status: AccountStatusEnum;
  chains: string[];
  address?: string;
  balance?: string;
  currency?: string;
  totalValue?: number;
  accountInfo: any;

  loading?: boolean;

  onConnect?: () => void;
  onDisconnect?: () => void;
  // onConnected?: () => void;
}

export const AccountStatusBar: FC<AccountStatusProps> = (props) => {
  const { status = AccountStatusEnum.NotConnected } = props;
  const { logoUrl, errors } = useContext(OrderlyContext);

  const [infoOpen, setInfoOpen] = useState(false);

  const buttonLabel = useMemo(() => {
    switch (status) {
      case AccountStatusEnum.NotConnected:
        return "Connect Wallet";
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
  }, [status, props.address]);

  return (
    <div className="flex items-center justify-between w-full">
      {status !== AccountStatusEnum.NotConnected &&
      !errors?.ChainNetworkNotSupport ? (
        <AccountTotal
          status={status}
          currency={props.currency}
          totalValue={props.totalValue}
          accountInfo={props.accountInfo}
        />
      ) : (
        <div />
      )}

      <div className="flex gap-2">
        <Chains disabled={status < AccountStatusEnum.NotConnected} />
        {status === AccountStatusEnum.NotConnected ? (
          <Button
            size={"small"}
            loading={props.loading}
            variant={"gradient"}
            className="bg-gradient-to-r from-[#26FEFE] to-[#59B0FE] text-base-100 hover:text-base-300 h-[30px]"
            onClick={() => props.onConnect?.()}
          >
            {buttonLabel}
          </Button>
        ) : (
          <Sheet open={infoOpen} onOpenChange={setInfoOpen}>
            <SheetTrigger asChild>
              <Button
                size={"small"}
                variant={"gradient"}
                className="bg-gradient-to-r from-[#26FEFE] to-[#59B0FE] text-base-100 hover:text-base-300 h-[30px]"
                loading={props.loading}
                disabled={props.loading || errors?.ChainNetworkNotSupport}
              >
                {buttonLabel}
              </Button>
            </SheetTrigger>
            <SheetContent forceMount>
              <SheetHeader leading={<Logo image={logoUrl} size={30} />}>
                My account
              </SheetHeader>
              <AccountInfo
                onDisconnect={props.onDisconnect}
                close={() => setInfoOpen(false)}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};
