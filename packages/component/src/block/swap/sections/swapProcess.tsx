import { useEffect, useState } from "react";
import { BridgeAndSwapProcessStatus } from "./bridgeAndSwapProcessStatus";
import { SwapMode, SwapProcessStatusStatus } from "./misc";
import { SwapProcessStatus } from "./swapProcessStatus";

interface Props {
  status: string;
  message: any;
  tx?: any;
  mode: SwapMode;
  chainInfo?: any;
}

export const SwapProcess = (props: Props) => {
  console.log({ props });

  const [status, setStatus] = useState<SwapProcessStatusStatus>(
    props.mode === SwapMode.Cross
      ? SwapProcessStatusStatus.Bridging
      : SwapProcessStatusStatus.Depositing
  );

  useEffect(() => {
    if (props.status === "DELIVERED") {
      setStatus(SwapProcessStatusStatus.Depositing);

      //TODO: 模拟3s 后状态变更, 发布时需要移除
      setTimeout(() => {
        setStatus(SwapProcessStatusStatus.Done);
      }, 3000);
    }

    if (props.status === "FAILED") {
      setStatus(SwapProcessStatusStatus.BridgeFialed);
    }
  }, [props.status]);

  //TODO: 模拟3s 后状态变更, 发布时需要移除
  useEffect(() => {
    setTimeout(() => {
      setStatus(SwapProcessStatusStatus.Done);
    }, 3000);
  }, []);

  if (props.mode === SwapMode.Cross) {
    return (
      <BridgeAndSwapProcessStatus status={status} message={props.message} />
    );
  }

  return (
    <SwapProcessStatus
      status={status}
      tx={props.tx}
      chainInfo={props.chainInfo}
    />
  );
};
