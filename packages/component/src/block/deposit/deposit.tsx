"use client";

import { FC, useCallback, useMemo, useState } from "react";
import { Input } from "@/input";
import Button from "@/button";
import { QuantityInput } from "@/block/quantityInput";
import { WalletPicker } from "../pickers/walletPicker";
import { Divider } from "@/divider";
import { ArrowDown } from "lucide-react";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/deposit/sections/summary";
import { NetworkImage } from "@/icon/networkImage";
import { StatusGuardButton } from "@/button/statusGuardButton";
import { AccountStatus } from "@orderly.network/core";
import { Chain, Wallet } from "@/block/pickers/walletPicker/walletPicker";
import { SvgImage } from "@/icon";

export enum DepositStatus {
  // NotSupported = "NotSupported",
  // NotConnected = "NotConnected",
  Checking = "Checking",
  // Unsettle = "Unsettle",
  InsufficientBalance = "InsufficientBalance",
  Normal = "Normal",
}

export interface DepositProps {
  // accountStatus: AccountStatus;
  onDeposit?: () => void;
  availableTokens?: string[];

  availableNetworks?: string[];
  availableBalance?: number;
  wallet?: Wallet;
  activeChain?: Chain;
  status?: DepositStatus;

  onConnectWallet?: () => void;
}

export const Deposit: FC<DepositProps> = (props) => {
  const [quantity, setQuantity] = useState<string>("");
  const [status, setStatus] = useState<DepositStatus>(DepositStatus.Normal);
  const onDeposit = useCallback(() => {
    props.onDeposit?.();
  }, []);

  const onQuantityChange = useCallback(
    (values: { value: string }) => {
      // console.log(value);
      setQuantity(values.value);
      if (
        Number.isNaN(Number(props.availableBalance)) ||
        Number(values.value) > props.availableBalance!
      ) {
        setStatus(DepositStatus.InsufficientBalance);
      } else {
        setStatus(DepositStatus.Normal);
      }
    },
    [props.availableBalance]
  );

  return (
    <div>
      <div className={"flex items-center py-2"}>
        <div className="flex-1">Your Web3 Wallet</div>
        {props.wallet?.icon ? (
          <SvgImage svg={props.wallet?.icon} rounded />
        ) : null}
      </div>
      <div className="py-2">
        <WalletPicker wallet={props.wallet} activeChain={props.activeChain} />
      </div>
      <QuantityInput
        tokens={[]}
        quantity={quantity}
        availableBalances={props.availableBalance}
        onValueChange={onQuantityChange}
        status={
          status === DepositStatus.InsufficientBalance ? "error" : undefined
        }
        onMaxClick={() => {
          if (!Number.isNaN(props.availableBalance)) {
            setQuantity(`${props.availableBalance}`);
          }
        }}
      />
      {status === DepositStatus.InsufficientBalance ? (
        <div
          className={"text-danger list-item text-sm pt-2 list-disc list-inside"}
        >
          Insufficient Balance
        </div>
      ) : null}
      <Divider className={"py-4"}>
        <ArrowDown size={22} className={"text-primary"} />
      </Divider>
      <div className="flex py-2">
        <div className={"flex-1"}>Your WOOFi DEX Wallet</div>
        <NetworkImage type={"placeholder"} rounded />
      </div>
      <div className={"py-2"}>
        <TokenQtyInput value={quantity} readOnly />
      </div>
      <Summary />
      <StatusGuardButton
        connected={!!props.wallet}
        onConnectWallet={props.onConnectWallet}
      >
        <Button fullWidth onClick={onDeposit}>
          Deposit
        </Button>
      </StatusGuardButton>
    </div>
  );
};
