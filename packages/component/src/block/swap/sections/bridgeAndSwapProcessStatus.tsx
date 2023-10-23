import { FC, useMemo, useState } from "react";
import { StatusTile } from "./statusTile";
import { Divider } from "@/divider";
import Button from "@/button";
import { SwapProcessStatusStatus } from "./misc";

interface SwapProcessStatusProps {
  status: SwapProcessStatusStatus;
  message: any;
  onComplete?: () => void;
}

export const BridgeAndSwapProcessStatus: FC<SwapProcessStatusProps> = (
  props
) => {
  const { status, message } = props;

  const statusUrl = useMemo(() => {
    if (status < SwapProcessStatusStatus.Depositing || !message) {
      return;
    }
    return `https://layerzeroscan.com/${message.srcChainId}/address/${message.srcUaAddress}/message/${message.dstChainId}/address/${message.dstUaAddress}/nonce/${message.srcUaNonce}`;
  }, [status, message]);

  const getBridgeStatus = (status: SwapProcessStatusStatus) => {
    if (status === SwapProcessStatusStatus.Bridging) {
      return "pending";
    }
    if (status === SwapProcessStatusStatus.BridgeFialed) {
      return "failed";
    }
    return "success";
  };

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
            state={getBridgeStatus(status)}
            title={"Bridging"}
            description={"Bridge to Arbitrum via Stargate"}
            index={1}
          />
          <StatusTile
            state={getDepositStatus(status)}
            title={"Deposit"}
            description={"Deposit to WOOFi Pro"}
            index={2}
          />
          <Divider />
          <div className="flex justify-center mt-3">
            <button
              className="text-sm text-primary-light disabled:text-base-contrast/10"
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
      {(status === SwapProcessStatusStatus.DepositFailed ||
        status === SwapProcessStatusStatus.BridgeFialed) && (
        <div className="pb-7 text-danger text-center text-sm">
          Failed to deposit, please try again later.
        </div>
      )}
      <Button fullWidth disabled={status < SwapProcessStatusStatus.Done}>
        OK
      </Button>
    </>
  );
};
