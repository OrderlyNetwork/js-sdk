import { FC, useState } from "react";
import { StatusTile } from "./statusTile";
import { Divider } from "@/divider";
import Button from "@/button";

interface SwapProcessStatusProps {
  state: SwapProcessStatusState;
}

export enum SwapProcessStatusState {
  Bridging = 0,
  BridgeFialed = 1,
  Depositing = 2,
  DepositFailed = 3,
  Done = 4,
}

export const SwapProcessStatus: FC<SwapProcessStatusProps> = (props) => {
  const { state } = props;

  console.log({ state });

  return (
    <>
      <div className="py-[24px]">
        <div className="bg-base-300 rounded py-3 px-5">
          <StatusTile
            state={
              state > SwapProcessStatusState.Bridging
                ? "success"
                : state === SwapProcessStatusState.Bridging
                ? "pending"
                : "disabled"
            }
            title={"Bridging"}
            description={"Bridge to Arbitrum via Stargate"}
            index={1}
          />
          <StatusTile
            state={
              state < SwapProcessStatusState.Depositing
                ? "disabled"
                : state === SwapProcessStatusState.Depositing
                ? "failed"
                : "success"
            }
            title={"Deposit"}
            description={"Deposit to WOOFi Pro"}
            index={2}
          />
          <Divider />
          <div className="flex justify-center mt-3">
            <a href="" className="text-sm text-primary-light">
              View Status
            </a>
          </div>
        </div>
      </div>
      <Button fullWidth disabled>
        OK
      </Button>
      <div className="flex justify-center text-sm gap-2 mt-3">
        <span className="text-base-contrast/50">Need help?</span>
        <a href="" className="text-primary-light">
          View FAQs
        </a>
      </div>
    </>
  );
};
