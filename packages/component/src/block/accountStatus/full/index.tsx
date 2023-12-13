import Button from "@/button";
import { Assets } from "./assets";
import { Divider } from "@/divider";
import { FC, useContext } from "react";
import { AssetsContext, AssetsProvider } from "@/provider";

interface Props {
  // onWithdraw?: () => void;
  // onDeposit?: () => void;
}

export const AccountInfo: FC<Props> = (props) => {
  const { visible, toggleVisible, onDeposit, onWithdraw } =
    useContext(AssetsContext);

  return (
    <>
      <div className="orderly-flex orderly-items-center orderly-py-4">
        <div
          className={
            "orderly-flex-1 orderly-text-base-contrast-80 orderly-text-sm"
          }
        >
          Account
        </div>
        <div className="orderly-flex orderly-gap-2">
          <Button
            size={"small"}
            variant={"outlined"}
            color={"tertiary"}
            onClick={() => onWithdraw?.()}
          >
            Withdraw
          </Button>
          <Button
            size={"small"}
            variant={"outlined"}
            color={"tertiary"}
            onClick={() => onDeposit?.()}
          >
            Deposit
          </Button>
        </div>
      </div>
      <Divider />
      {/* <AssetsProvider> */}
        <Assets totalBalance={1013130} />
      {/* </AssetsProvider> */}
    </>
  );
};
