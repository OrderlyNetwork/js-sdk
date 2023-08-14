import { FC } from "react";
import { Input } from "@/input";
import Button from "@/button";
import { QuantityInput } from "@/block/quantityInput";
import { WalletPicker } from "../pickers/walletPicker";
import { Divider } from "@/divider";
import { ArrowDown } from "lucide-react";
import { TokenQtyInput } from "@/input/tokenQtyInput";

export interface DepositProps {
  onDeposit?: () => void;
}

export const Deposit: FC<DepositProps> = (props) => {
  return (
    <div>
      <div className={"flex"}>
        <div className="flex-1">Your Web3 Wallet</div>
        <div>Wallet</div>
      </div>
      <div className="py-2">
        <WalletPicker />
      </div>
      <QuantityInput tokens={[]} />
      <Divider className={"py-4"}>
        <ArrowDown size={20} className={"text-primary"} />
      </Divider>
      <div className="flex">
        <div>Your WOOFi DEX Wallet</div>
      </div>
      <TokenQtyInput />
      <div className="flex my-3">
        <div className="flex-1">
          <div>1USDC = 1USD</div>
          <div>Trading Fee = 0USDC</div>
        </div>
        <div>Slippage: 1%</div>
      </div>
      <Button fullWidth>Deposit</Button>
    </div>
  );
};
