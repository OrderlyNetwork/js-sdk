import { Divider } from "@/divider";
import { Coin } from "@/icon";
import { ArrowDownIcon } from "@radix-ui/react-icons";
import { FC } from "react";

export interface WithdrawProps {}

export const Withdraw: FC<WithdrawProps> = (props) => {
  return (
    <div>
      <div className="flex">
        <div className="flex-1">Your WOOFi DEX Wallet</div>
        <Coin name="WOO" size="small" />
      </div>
      <Divider>
        <ArrowDownIcon />
      </Divider>
    </div>
  );
};
