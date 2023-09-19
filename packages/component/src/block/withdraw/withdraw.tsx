import { Divider } from "@/divider";
import { Coin, MoveDownIcon } from "@/icon";
import { FC } from "react";
import { QuantityInput } from "@/block/quantityInput";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/withdraw/sections/summary";
import Button from "@/button";
import { WalletPicker } from "../pickers/walletPicker";
import { cn } from "@/utils/css";
import { NetworkImage } from "@/icon/networkImage";
import { WithdrawStatus } from "@orderly.network/types";

export interface WithdrawProps {
  status: WithdrawStatus;
}

export const Withdraw: FC<WithdrawProps> = ({
  status = WithdrawStatus.Normal,
}) => {
  return (
    <>
      <div className="flex items-center py-2">
        <div className="flex-1">Your WOOFi DEX Wallet</div>
        <Coin name="WOO" />
      </div>
      <QuantityInput
        tokens={[]}
        className={cn(status !== WithdrawStatus.Normal && "outline outline-1", {
          "outline-trade-loss": status === WithdrawStatus.InsufficientBalance,
          "outline-yellow-500": status === WithdrawStatus.Unsettle,
        })}
      />
      <Divider className={"py-3"}>
        <MoveDownIcon className={"text-primary-light"} />
      </Divider>
      <div className={"flex items-center"}>
        <div className={"flex-1"}>Your Web3 Wallet</div>
        <NetworkImage type={"placeholder"} rounded />
      </div>
      <div className={"py-2"}>
        <WalletPicker />
      </div>
      <TokenQtyInput />

      <Summary />
      <div className="py-3 flex justify-center">
        {/*<Button fullWidth>Switch to NEAR Mainnet</Button>*/}
        <Button className="w-2/3">Withdraw</Button>
      </div>
    </>
  );
};
