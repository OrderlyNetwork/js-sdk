import { useEffect, useState } from "react";

export function useNeedSwapAndCross(
  symbol?: string,
  currentChainId?: number,
  dstChainId?: number
) {
  const [needSwap, setNeedSwap] = useState<boolean>(false);
  const [needCrossSwap, setNeedCrossSwap] = useState<boolean>(false);

  useEffect(() => {
    if (!symbol || !currentChainId) return;
    // if symbol is not USDC, it will need swap
    setNeedSwap(symbol !== "USDC");

    if (currentChainId !== dstChainId) {
      setNeedCrossSwap(true);
      setNeedSwap(true);
    } else {
      setNeedCrossSwap(false);
    }
  }, [symbol, currentChainId, dstChainId]);

  // console.log("useNeedSwapAndCross", needSwap, needCrossSwap);

  return { needSwap, needCrossSwap };
}
