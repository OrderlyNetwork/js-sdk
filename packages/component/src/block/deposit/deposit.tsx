import { FC } from "react";
import { Input } from "@/input";
import Button from "@/button";

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
      <div className="flex">
        <div className={"flex-1"}>wallet address</div>
        <div className={"flex-1"}>Chain select</div>
      </div>
      <div className="bg-slate-400 rounded p-2">
        <div className="flex">
          <div className="flex-1">
            <div className="flex justify-between">
              <span>Quantity</span>
              <button>Max</button>
            </div>
          </div>
          <div>Token Picker</div>
        </div>
        <div className={"flex justify-between"}>
          <div></div>
          <div>Available:3500 USDC</div>
        </div>
      </div>
      <hr />
      <div className="flex">
        <div>Your WOOFi DEX Wallet</div>
      </div>
      <Input suffix={<div>USDC</div>} />
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
