import { useEffect, useState } from "react";

export function useNeedSwapAndCross(options: {
  isCollateral?: boolean;
  srcChainId?: number;
  dstChainId?: number;
}) {
  const { isCollateral, srcChainId, dstChainId } = options;
  const [needSwap, setNeedSwap] = useState(false);
  const [needCrossSwap, setNeedCrossSwap] = useState(false);

  useEffect(() => {
    if (!srcChainId) return;

    // if isCollateral is false, it will need swap
    setNeedSwap(!isCollateral);

    if (srcChainId !== dstChainId) {
      setNeedCrossSwap(true);
      setNeedSwap(true);
    } else {
      setNeedCrossSwap(false);
    }
  }, [isCollateral, srcChainId, dstChainId]);

  return { needSwap, needCrossSwap };
}
