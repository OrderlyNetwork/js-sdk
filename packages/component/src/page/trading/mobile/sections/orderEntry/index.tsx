import { OrderEntry } from "@/block/orderEntry";
import React, { FC, useContext, useEffect, useRef, useState } from "react";
import {
  useOrderEntry,
  useAccount,
  useEventEmitter,
  useLocalStorage,
  useSessionStorage,
} from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  OrderEntity,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { AssetsContext, AssetsProvider } from "@/provider/assetsProvider";
import { OrderParams } from "@orderly.network/hooks";

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

  /// local storage hidden check box
  const [visibleQuantity, setVisibleQuantity] = useLocalStorage("visible_quantity_key", 0);

  /// session storage
  const [orderType, setOrderType] = useSessionStorage("order_type_key", OrderType.LIMIT);
  const [reduceOnly, setReduceOnly] = useSessionStorage("reduce_only_key", false);
  const [orderSide, setOrderSide] = useSessionStorage("order_side_key", OrderSide.BUY);
  const [orderTypeExt, setOrderTypeExt] = useSessionStorage("order_type_ext_key", undefined);
  const [sessionOrderEntry, setSessionOrderEntry] = useSessionStorage("order_entry_info", {
    "order_price": "",
    "order_quantity": "",
    "trigger_price": "",
  });

  const [order, setOrder] = useState<OrderParams>({
    reduce_only: reduceOnly,
    side: orderSide,
    order_type: orderType,
    isStopOrder: orderType === OrderType.STOP_LIMIT || orderType === OrderType.STOP_MARKET,
    symbol,
    visible_quantity: visibleQuantity,
    order_type_ext: orderType === OrderType.LIMIT ? orderTypeExt : undefined,
    // timestamp: Date.now(),
    ...sessionOrderEntry,
  });

  // const [reduceOnly, setReduceOnly] = useState(false);
  const formState = useOrderEntry(order, {
    watchOrderbook: true,
  });

  useEffect(() => {
    setOrder((order) => ({
      ...order,
      order_price: "",
      order_quantity: "",
      trigger_price: "",
      symbol,
    }));

    setSessionOrderEntry({
      "order_price": "",
      "order_quantity": "",
      "trigger_price": "",
    });
  }, [symbol]);

  useEffect(() => {
    // console.log(
    //   "=======>>>>>>>>formState.formattedOrder",
    //   formState.formattedOrder.total,
    //   formState.formattedOrder.order_quantity
    // );
    order.order_quantity = formState.formattedOrder.order_quantity;
    order.total = formState.formattedOrder.total;
  }, [formState.formattedOrder.total, formState.formattedOrder.order_quantity]);

  return (
    <div id="orderly-order-entry" className="orderly-pl-1" ref={containerRef}>
      <OrderEntry
        {...formState}
        showConfirm
        // side={side}
        symbol={symbol}
        onFieldChange={(field, value) => {
          console.log("=======>>>>>>>>field", field, value);

          if (field === "order_type") {
            setOrderType(value);
          }

          if (field === "reduce_only") {
            setReduceOnly(value);
          }

          if (field === "side") {
            setOrderSide(value);
          }

          if (field === "visible_quantity") {
            setVisibleQuantity(value);
          }

          if (field === "order_type_ext") {
            setOrderTypeExt(value);
          }

          const include = ["order_price","order_quantity","trigger_price"].includes(field);
          if (include) {
            const newValue: any = {
              ...sessionOrderEntry,
            };
            newValue[field] = value;
            setSessionOrderEntry(newValue);
          }


          // if (field === "reduce_only") {
          //   setOrder((order) => ({
          //     ...order,
          //     order_quantity: "",
          //     order_price: "",
          //     [field]: value,
          //     // timestamp: Date.now(),
          //   }));
          // } else {
            setOrder((order) => ({
              ...order,
              [field]: value,
              // timestamp: Date.now(),
            }));
          // }
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
