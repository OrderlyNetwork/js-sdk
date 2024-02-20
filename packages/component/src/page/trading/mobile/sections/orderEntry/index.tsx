import { OrderEntry } from "@/block/orderEntry";
import React, { FC, useContext, useEffect, useRef, useState } from "react";
import {
  useOrderEntry,
  useAccount,
  useEventEmitter,
} from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { AssetsContext, AssetsProvider } from "@/provider/assetsProvider";

interface MyOrderEntryProps {
  symbol: string;
}

export const MyOrderEntry: FC<MyOrderEntryProps> = (props) => {
  const { symbol } = props;
  const { onDeposit } = useContext(AssetsContext);

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

  const [order, setOrder] = useState<OrderEntity>({
    reduce_only: false,
    side: OrderSide.BUY,
    order_type: OrderType.LIMIT,
    isStopOrder: false,
  });
  // const [reduceOnly, setReduceOnly] = useState(false);
  const formState = useOrderEntry(
    {
      ...order,
      symbol,
    },
    {
      watchOrderbook: true,
    }
  );

  useEffect(() => {
    setOrder((order) => ({
      ...order,
      order_price: "",
      order_quantity: "",
      trigger_price: "",
      symbol,
    }));
  }, [symbol]);

  return (
    <div id="orderly-order-entry" className="orderly-pl-1" ref={containerRef}>
      <OrderEntry
        {...formState}
        showConfirm
        // side={side}
        symbol={symbol}
        onFieldChange={(field, value) => {
          console.log("=======>>>>>>>>field", field, value);

          if (field === "reduce_only" || field === "order_type") {
            setOrder((order) => ({
              ...order,
              order_quantity: "",
              order_price: "",
              [field]: value,
            }));
          } else {
            setOrder((order) => ({ ...order, [field]: value }));
          }
        }}
        setValues={(values) => {
          setOrder((order) => ({
            ...order,
            ...values,
          }));
        }}
        // onReduceOnlyChange={setReduceOnly}
        disabled={state.status < AccountStatusEnum.EnableTrading}
        onDeposit={onDeposit}
      />
    </div>
  );
};
