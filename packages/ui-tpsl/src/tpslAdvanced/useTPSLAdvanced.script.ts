import { useEffect, useState } from "react";
import { OrderValidationResult, useOrderEntry } from "@orderly.network/hooks";
import { OrderlyOrder, OrderType, PositionType } from "@orderly.network/types";

type Props = {
  order: OrderlyOrder;
  setOrderValue: (key: string, value: any) => void;
  onSubmit: (formattedOrder: OrderlyOrder) => void;
  onClose: () => void;
  symbolLeverage?: number;
};

const isTPSLEnable = (order: OrderlyOrder, type: "tp" | "sl") => {
  if (order.tp_trigger_price || order.sl_trigger_price) {
    if (type === "tp") {
      return !!order.tp_trigger_price;
    }
    if (type === "sl") {
      return !!order.sl_trigger_price;
    }
  }
  // no edit, disabled tp /sl
  return false;
};

export const useTPSLAdvanced = (props: Props) => {
  const { order, setOrderValue, onClose } = props;
  const [innerMetaState, setInnerMetaState] =
    useState<OrderValidationResult | null>(null);
  const {
    formattedOrder,
    setValue,
    setValues,
    helper,
    symbolInfo,
    metaState,
    ...state
  } = useOrderEntry(order.symbol, {
    initialOrder: {
      symbol: order.symbol,
      order_type: order.order_type,
      side: order.side,
      order_price: order.order_price,
      order_quantity: order.order_quantity,
      position_type: order.position_type ?? PositionType.PARTIAL,
      trigger_price: order.trigger_price,
      // tp_enable: isTPSLEnable(order, "tp"),
      // sl_enable: isTPSLEnable(order, "sl"),
      tp_trigger_price: order.tp_trigger_price,
      sl_trigger_price: order.sl_trigger_price,
      tp_order_price: order.tp_order_price,
      sl_order_price: order.sl_order_price,
      tp_order_type: order.tp_order_type,
      sl_order_type: order.sl_order_type,
      sl_pnl: order.sl_pnl,
      sl_offset: order.sl_offset,
      sl_offset_percentage: order.sl_offset_percentage,
      tp_pnl: order.tp_pnl,
      tp_offset: order.tp_offset,
      tp_offset_percentage: order.tp_offset_percentage,
    },
  });

  const onSubmit = () => {
    helper
      .validate()
      .then(() => {
        props.onSubmit(formattedOrder as OrderlyOrder);
      })
      .catch((err) => {
        console.log("metaState", metaState);
        console.log("err", err);
      });
  };

  return {
    order,
    formattedOrder,
    symbolInfo,
    setValue,
    setValues,
    onSubmit,
    onClose,
    metaState,
    symbolLeverage: props.symbolLeverage,
  };
};
