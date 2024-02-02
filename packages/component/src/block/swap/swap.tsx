import { FC } from "react";
import { SymbolInfo } from "./sections/symbols";

import { SwapMode } from "./sections/misc";
import { API } from "@orderly.network/types";
import { CrossSwap } from "./sections/crossSwap";
import { SingleSwap } from "./sections/singleSwap";

export interface SwapProps {
  mode: SwapMode;
  src: SymbolInfo;
  dst: SymbolInfo;
  chain?: API.NetworkInfos;
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
