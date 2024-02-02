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
  brokerName?: string;
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
      <div className="orderly-py-[24px]">
        <div className="orderly-bg-base-500 orderly-rounded-borderRadius-lg orderly-py-3 orderly-px-5">
          <StatusTile
            state={getDepositStatus(status)}
            title={"Deposit"}
            description={`Deposit to ${props.brokerName}`}
            index={1}
          />
          <Divider className="before:orderly-border-b-base-contrast-12 after:orderly-border-b-base-contrast-12" />
          <div className="orderly-flex orderly-justify-center orderly-mt-3">
            <button
              className="orderly-text-2xs orderly-text-primary-light disabled:orderly-text-base-contrast/10"
              disabled={!statusUrl}
              onClick={() => {
                (location as any).href = statusUrl;
              }}
            >
              View Status
            </button>
          </div>
        </div>
      </div>
      {status === SwapProcessStatusStatus.DepositFailed && (
        <div className="orderly-pb-7 orderly-text-danger-light orderly-text-center orderly-text-2xs">
          Deposit failed, please try again later.
        </div>
      )}
      <Button
        fullWidth
        className="orderly-text-xs"
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
