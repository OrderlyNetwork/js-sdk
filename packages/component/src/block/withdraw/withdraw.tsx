import { Divider } from "@/divider";
import { ArrowDownIcon } from "@radix-ui/react-icons";
import { FC } from "react";

export interface WithdrawProps {}

export const Withdraw: FC<WithdrawProps> = (props) => {
  return (
    <div>
      <div>Your WOOFi DEX Wallet</div>
      <Divider>
        <ArrowDownIcon />
      </Divider>
    </div>
  );
};
