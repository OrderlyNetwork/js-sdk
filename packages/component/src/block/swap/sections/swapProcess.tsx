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
      />
    );
  }

  return (
    <SwapProcessStatus
      status={status}
      tx={props.tx}
      chainInfo={props.chainInfo}
      onComplete={props.onComplete}
    />
  );
};
