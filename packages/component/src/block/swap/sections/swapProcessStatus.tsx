import { FC, useMemo, useState } from "react";
import { StatusTile } from "./statusTile";
import { Divider } from "@/divider";
import Button from "@/button";
import { SwapProcessStatusStatus } from "./misc";

interface SwapProcessStatusProps {
  status: SwapProcessStatusStatus;
  tx: any;
  chainInfo: any;
  onComplete?: (isSuccss: boolean) => void;
}

export const SwapProcessStatus: FC<SwapProcessStatusProps> = (props) => {
  const { status, tx, chainInfo } = props;

  const statusUrl = useMemo(() => {
    if (status < SwapProcessStatusStatus.Depositing || !tx) {
      return;
    }
    return `${chainInfo.explorer_base_url}/tx/${tx.hash}`;
  }, [status, tx]);

  const getDepositStatus = (status: SwapProcessStatusStatus) => {
    if (status < SwapProcessStatusStatus.Depositing) {
      return "disabled";
    }
    if (status === SwapProcessStatusStatus.Depositing) {
      return "pending";
    }
    if (status === SwapProcessStatusStatus.DepositFailed) {
      return "failed";
    }
    return "success";
  };

  return (
    <>
      <div className="py-[24px]">
        <div className="bg-base-300 rounded py-3 px-5">
          <StatusTile
            state={getDepositStatus(status)}
            title={"Deposit"}
            description={"Deposit to WOOFi Pro"}
            index={1}
          />
          <Divider />
          <div className="flex justify-center mt-3">
            <button
              className="text-sm text-primary-light disabled:text-base-contrast/10"
              disabled={!statusUrl}
              onClick={() => {
                console.log("statusUrl", statusUrl);
                (location as any).href = statusUrl;
              }}
            >
              View Status
            </button>
          </div>
        </div>
      </div>
      {status === SwapProcessStatusStatus.DepositFailed && (
        <div className="pb-7 text-danger text-center text-sm">
          Deposit failed, please try again later.
        </div>
      )}
      <Button
        fullWidth
        disabled={status < SwapProcessStatusStatus.DepositFailed}
        onClick={() =>
          props.onComplete?.(status === SwapProcessStatusStatus.Done)
        }
      >
        OK
      </Button>
    </>
  );
};
