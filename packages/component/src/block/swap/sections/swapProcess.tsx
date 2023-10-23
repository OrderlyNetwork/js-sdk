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
}

export const SwapProcess = (props: Props) => {
  // console.log({ props });

  const [status, setStatus] = useState<SwapProcessStatusStatus>(
    props.mode === SwapMode.Cross
      ? SwapProcessStatusStatus.Bridging
      : SwapProcessStatusStatus.Depositing
  );

  useEffect(() => {
    if (props.bridgeStatus === "DELIVERED") {
      setStatus(SwapProcessStatusStatus.Depositing);

      //TODO: 模拟3s 后状态变更, 发布时需要移除
      setTimeout(() => {
        setStatus(SwapProcessStatusStatus.Done);
      }, 5000);
    }

    if (props.bridgeStatus === "FAILED") {
      setStatus(SwapProcessStatusStatus.BridgeFialed);
    }
  }, [props.bridgeStatus]);

  //TODO: 模拟3s 后状态变更, 发布时需要移除
  useEffect(() => {
    if (!!props.tx && props.mode === SwapMode.Single) {
      setTimeout(() => {
        setStatus(SwapProcessStatusStatus.Done);
      }, 5000);
    }
  }, [props.tx]);

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
