import { OrderEntry } from "@/block/orderEntry";
import React, { FC, useContext, useEffect, useRef, useState } from "react";
import {
  useOrderEntry_deprecated,
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
import {
  setEntrySessionStorage,
  clearOrderEntrySessionData,
  getEntrySessionStorageInfo,
} from "./entrySessionStorageUtils";

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
  const [visibleQuantity, setVisibleQuantity] = useLocalStorage(
    "visible_quantity",
    1
  );

  /// session storage
  const sessionData = getEntrySessionStorageInfo();
  const orderType = sessionData.orderType;
  const reduceOnly = sessionData.reduceOnly;
  const orderSide = sessionData.orderSide;
  const orderTypeExt = sessionData.orderTypeExt;
  const sessionOrderEntry = sessionData.sessionOrderEntry;

  const [order, setOrder] = useState<OrderParams>({
    reduce_only: reduceOnly,
    side: orderSide,
    order_type: orderType,
    isStopOrder:
      orderType === OrderType.STOP_LIMIT || orderType === OrderType.STOP_MARKET,
    symbol,
    visible_quantity: visibleQuantity,
    order_type_ext: orderType === OrderType.LIMIT ? orderTypeExt : undefined,
    // timestamp: Date.now(),
    ...sessionOrderEntry,
  });

  // const [reduceOnly, setReduceOnly] = useState(false);
  const formState = useOrderEntry_deprecated(order, {
    watchOrderbook: true,
  });

  useEffect(() => {
    setOrder((order) => ({
      ...order,
      order_price: "",
      order_quantity: "",
      trigger_price: "",
      total: "",
      symbol,
    }));

    clearOrderEntrySessionData();
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

          /// save to local storage and refresh ui
          if (field === "visible_quantity") {
            setVisibleQuantity(value);
          }

          /// save to session storage and not refresh ui
          setEntrySessionStorage(field, value);

          // if (field === "reduce_only") {
          //   setOrder((order) => ({
          //     ...order,
          //     order_quantity: "",
          //     order_price: "",
          //     [field]: value,
          //     // timestamp: Date.now(),
          //   }));
          // } else {

          if (
            field === "order_type" &&
            (value === OrderType.STOP_LIMIT ||
              value === OrderType.STOP_MARKET ||
              value === OrderType.MARKET)
          ) {
            // const {order_type_ext, ...rest} = nValue;
            // nValue = rest;

            setOrder((order) => {
              const { order_type_ext, ...rest } = order;
              return {
                ...rest,
                [field]: value,
              };
            });
          } else {
            setOrder((order) => ({
              ...order,
              [field]: value,
              // timestamp: Date.now(),
            }));
          }

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
