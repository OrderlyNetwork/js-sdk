import { FC, LegacyRef, useEffect, useRef, useState } from "react";
import { cn, Flex, Grid, Text } from "@orderly.network/ui";
import { OrderBookAndEntryState } from "./orderBookAndEntry.script";
import { OrderBookWidget } from "../../base/orderBook";
import { OrderEntryWidget } from "@orderly.network/ui-order-entry";

export const OrderBookAndEntry: FC<
  OrderBookAndEntryState & {
    className?: string;
  }
> = (props) => {
  const [height, setHeight] = useState(0); 
  const divRef = useRef(null); 

  useEffect(() => {
    const div = divRef.current;

    if (!div) return;

    
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
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
        "oui-grid oui-grid-cols-[4fr,6fr] oui-gap-1 oui-mx-1 ",
        props.className
      )}
    >
      <div className="oui-bg-base-9 oui-rounded-xl" style={{
        height: `${height + 16}px`
      }}>
        <OrderBookWidget
          symbol={props.symbol}
          height={height ? height - 44 : undefined}
          tabletMediaQuery={props.tabletMediaQuery}
        />
      </div>
      <div className="oui-bg-base-9 oui-rounded-xl oui-p-2" >
        <OrderEntryWidget symbol={props.symbol} containerRef={divRef}/>
      </div>
    </div>
  );
};
