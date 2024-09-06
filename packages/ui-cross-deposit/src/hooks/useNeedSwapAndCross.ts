import { useEffect, useState } from "react";

export function useNeedSwapAndCross(options: {
  symbol?: string;
  srcChainId?: number;
  dstChainId?: number;
}) {
  const { symbol, srcChainId, dstChainId } = options;
  const [needSwap, setNeedSwap] = useState(false);
  const [needCrossSwap, setNeedCrossSwap] = useState(false);

  useEffect(() => {
    if (!symbol || !srcChainId) return;

    // if symbol is not USDC, it will need swap
    setNeedSwap(symbol !== "USDC");

    if (srcChainId !== dstChainId) {
      setNeedCrossSwap(true);
      setNeedSwap(true);
    } else {
      setNeedCrossSwap(false);
    }
  }, [symbol, srcChainId, dstChainId]);

  return { needSwap, needCrossSwap };
}
