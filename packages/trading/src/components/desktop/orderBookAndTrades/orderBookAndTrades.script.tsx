import { useEffect, useRef, useState } from "react";

export const useOrderBookAndTradesScript = (symbol: string) => {
  const [containerSize, setContainerSize] = useState<
    | {
        width: number;
        height: number;
      }
    | undefined
  >(undefined);

  const [tab, setTab] = useState<"orderBook" | "lastTrades">("orderBook");

  const containerRef = useRef<HTMLDivElement>();

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({
          width,
          height,
        });
      }
    });

    const targetDiv = containerRef.current;

    if (targetDiv) {
      resizeObserver.observe(targetDiv);
    }

    return () => {
      if (targetDiv) {
        resizeObserver.unobserve(targetDiv);
      }
    };
  }, []);

  return {
    symbol,
    containerSize,
    containerRef: containerRef as any,
    tab,
    setTab,
  };
};

export type OrderBookAndTradesState = ReturnType<
  typeof useOrderBookAndTradesScript
>;
