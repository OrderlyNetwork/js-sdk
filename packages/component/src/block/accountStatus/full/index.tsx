import Button from "@/button";
import { Assets } from "./assets";
import { Divider } from "@/divider";

export const AccountInfo = () => {
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
          <Button size={"small"} variant={"outlined"} color={"tertiary"}>
            Withdraw
          </Button>
          <Button size={"small"} variant={"outlined"} color={"tertiary"}>
            Deposit
          </Button>
        </div>
      </div>
      <Divider />
      <Assets totalBalance={1013130} />
    </>
  );
};
