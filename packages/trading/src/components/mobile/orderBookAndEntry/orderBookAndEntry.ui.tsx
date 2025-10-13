import React, { useEffect, useRef, useState } from "react";
import { cn } from "@kodiak-finance/orderly-ui";
import { OrderEntryWidget } from "@kodiak-finance/orderly-ui-order-entry";
import type { OrderBookAndEntryState } from "./orderBookAndEntry.script";

const LazyOrderBookWidget = React.lazy(() =>
  import("../../base/orderBook").then((mod) => {
    return { default: mod.OrderBookWidget };
  }),
);

export const OrderBookAndEntry: React.FC<
  OrderBookAndEntryState & { className?: string }
> = (props) => {
  const [height, setHeight] = useState(0);
  const divRef = useRef(null);

  useEffect(() => {
    const div = divRef.current;
    if (!div) {
      return;
    }
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeight(entry.contentRect.height);
      }
    });
    resizeObserver.observe(div);
    return () => {
      resizeObserver.unobserve(div);
    };
  }, []);
  return (
    <div
      className={cn(
        "oui-mx-1 oui-grid oui-grid-cols-[4fr,6fr] oui-gap-1 ",
        props.className,
      )}
    >
      <div
        className="oui-rounded-xl oui-bg-base-9"
        style={{ height: `${height + 16}px` }}
      >
        <React.Suspense fallback={null}>
          <LazyOrderBookWidget
            symbol={props.symbol}
            height={height ? height - 44 : undefined}
          />
        </React.Suspense>
      </div>
      <div className="oui-rounded-xl oui-bg-base-9 oui-p-2">
        <OrderEntryWidget symbol={props.symbol} containerRef={divRef} />
      </div>
    </div>
  );
};
