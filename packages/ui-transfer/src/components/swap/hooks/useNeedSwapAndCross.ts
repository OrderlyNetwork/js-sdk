import { useEffect, useState } from "react";
import { API } from "@orderly.network/types";

export function useNeedSwapAndCross(options: {
  srcToken?: API.TokenInfo;
  srcChainId?: number;
  dstChainId?: number;
}) {
  const { srcToken, srcChainId, dstChainId } = options;
  const [needSwap, setNeedSwap] = useState(false);
  const [needCrossSwap, setNeedCrossSwap] = useState(false);

  useEffect(() => {
    if (!srcChainId) return;

    // if srcToken is USDC, it will not need swap
    if (srcToken?.symbol === "USDC") {
      setNeedCrossSwap(false);
      setNeedSwap(false);
      return;
    }

    // if isCollateral is false or undefined, it will need swap
    setNeedSwap(!srcToken?.is_collateral);

    if (srcChainId !== dstChainId) {
      setNeedCrossSwap(true);
      setNeedSwap(true);
    } else {
      setNeedCrossSwap(false);
    }
  }, [srcToken, srcChainId, dstChainId]);

  return { needSwap, needCrossSwap };
}
