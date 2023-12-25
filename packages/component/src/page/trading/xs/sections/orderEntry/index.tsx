import { OrderEntry } from "@/block/orderEntry";
import React, { FC, useContext, useEffect, useRef, useState } from "react";
import {
  useOrderEntry,
  useAccount,
  useEventEmitter,
} from "@orderly.network/hooks";
import { AccountStatusEnum, OrderSide } from "@orderly.network/types";
import { AssetsContext, AssetsProvider } from "@/provider/assetsProvider";

interface MyOrderEntryProps {
  symbol: string;
}

export const MyOrderEntry: FC<MyOrderEntryProps> = (props) => {
  const { symbol } = props;
  const [side, setSide] = useState(OrderSide.BUY);
  const { onDeposit } = useContext(AssetsContext);
  const [reduceOnly, setReduceOnly] = useState(false);
  const { state } = useAccount();
  const ee = useEventEmitter();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver(function (entries) {
      if (Array.isArray(entries) && entries[0]) {
        ee.emit("dom:orderEntry:resize", {
          height: entries[0].contentBoxSize[0].blockSize,
          width: entries[0].contentBoxSize[0].inlineSize,
        });
      }
    });

    observer.observe(containerRef.current!);

    return () => {
      //
      if (containerRef.current) {
        observer.unobserve(containerRef.current!);
      }
    };
  }, []);

  const formState = useOrderEntry(symbol, side, reduceOnly);
  console.log(reduceOnly);

  return (
    <div id="orderly-order-entry" className="orderly-pl-1" ref={containerRef}>
      <OrderEntry
        {...formState}
        showConfirm
        side={side}
        onSideChange={setSide}
        symbol={symbol}
        onReduceOnlyChange={setReduceOnly}
        disabled={state.status < AccountStatusEnum.EnableTrading}
        onDeposit={onDeposit}
      />
    </div>
  );
};
