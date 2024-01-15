import { useEffect, useState } from "react";
import { BridgeAndSwapProcessStatus } from "./bridgeAndSwapProcessStatus";
import { SwapMode, SwapProcessStatusStatus } from "./misc";
import { SwapProcessStatus } from "./swapProcessStatus";

interface Props {
  bridgeStatus: string;
  message: any;
  tx?: any;
  mode: SwapMode;
  chainInfo?: any;
  onComplete?: () => void;
  status: SwapProcessStatusStatus;
  brokerName?: string;
}

export const SwapProcess = (props: Props) => {
  //
  const { status } = props;

  if (props.mode === SwapMode.Cross) {
    return (
      <BridgeAndSwapProcessStatus
        status={status}
        message={props.message}
        onComplete={props.onComplete}
        brokerName={props.brokerName}
      />
    );
  }

  return (
    <SwapProcessStatus
      status={status}
      tx={props.tx}
      chainInfo={props.chainInfo}
      onComplete={props.onComplete}
      brokerName={props.brokerName}
    />
  );
};
