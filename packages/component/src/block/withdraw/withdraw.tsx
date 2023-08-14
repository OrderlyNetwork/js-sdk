import { Divider } from "@/divider";
import { Coin } from "@/icon";
import { FC } from "react";
import { QuantityInput } from "@/block/quantityInput";
import { ArrowDown } from "lucide-react";
import { TokenQtyInput } from "@/input/tokenQtyInput";
import { Summary } from "@/block/withdraw/sections/summary";
import Button from "@/button";
import { WalletPicker } from "../pickers/walletPicker";

export interface WithdrawProps {}

export const Withdraw: FC<WithdrawProps> = (props) => {
  return (
    <>
      <div className="flex">
        <div className="flex-1">Your WOOFi DEX Wallet</div>
        <Coin name="WOO" size="small" />
      </div>
      <QuantityInput />
      <Divider className={"py-4"}>
        <ArrowDown size={20} className={"text-primary"} />
      </Divider>
      <div className={"flex items-center"}>
        <div className={"flex-1"}>Your Web3 Wallet</div>
      </div>
      <div className={"py-2"}>
        <WalletPicker />
      </div>
      <TokenQtyInput />

      <Summary />
      <div>
        <Button fullWidth>Switch to NEAR Mainnet</Button>
      </div>
    </>
  );
};
