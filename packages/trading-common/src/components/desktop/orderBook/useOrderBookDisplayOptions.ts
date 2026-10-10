import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { ORDERBOOK_COIN_TYPE_KEY } from "../../base/orderBook/orderContext";

/**
 * Shared display state for the desktop order book tree: resets the persisted
 * Total-column coin type when the symbol changes, and tracks whether the
 * container is wide enough (`>= 360px`) to show both total columns.
 */
export const useOrderBookDisplayOptions = (base: string, quote: string) => {
  const ref = useRef<HTMLDivElement>(null);

  const [showTotal, setShowTotal] = useState(false);

  const [coinType, setCoinType] = useLocalStorage(
    ORDERBOOK_COIN_TYPE_KEY,
    base,
  );

  useEffect(() => {
    if (coinType !== quote && base) {
      setCoinType(base);
    }
  }, [base, quote]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { inlineSize: width } = entry.borderBoxSize[0];
        setShowTotal(width >= 360);
      }
    });

    const targetDiv = ref.current;

    if (targetDiv) {
      resizeObserver.observe(targetDiv);
    }

    return () => {
      if (targetDiv) {
        resizeObserver.unobserve(targetDiv);
      }
    };
  }, []);

  return { ref, showTotal };
};
