import { FC } from "react";
import { API } from "@orderly.network/types";
import { NetworkInfos, SwapMode, SymbolInfo } from "../../types";
import { CrossSwap } from "./crossSwap";
import { SingleSwap } from "./singleSwap";

export interface SwapProps {
  mode: SwapMode;
  src: SymbolInfo;
  dst: SymbolInfo;
  chain?: NetworkInfos;
  nativeToken?: API.TokenInfo;
  depositFee?: bigint;
  transactionData: any;
  slippage: number;
  brokerName?: string;
  onComplete?: (isSuccss: boolean) => void;
  onCancel?: () => void;
  onFail?: () => void;
}

export const Swap: FC<SwapProps> = (props) => {
  const { mode } = props;

  if (mode === SwapMode.Cross) {
    return <CrossSwap {...props} />;
  }

  return <SingleSwap {...props} />;
};
