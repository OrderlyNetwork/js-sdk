import { useCallback, useEffect, useState } from "react";
import { useOrderEntity } from "@veltodefi/hooks";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@veltodefi/types";

export const useEditOrderEntry = (props: {
  order: API.AlgoOrderExt;
  orderType: OrderType;
  maxQty: number;
}) => {
  const { order, orderType, maxQty } = props;

  const [formattedOrder, setFormattedOrder] = useState({
    symbol: order.symbol,
    side: order.side as OrderSide,
    reduce_only: order.reduce_only,
    order_type: orderType,
    // TODO: trailing stop order edit price twice, order.price will be 0
    order_price: order.price || undefined,
    order_quantity: order.quantity,
    trigger_price: order.trigger_price,
    activated_price: order.activated_price,
    callback_value: order.callback_value,
    callback_rate: order.callback_rate ? order.callback_rate * 100 : undefined,
  });

  const { markPrice, errors, validate, clearErrors } = useOrderEntity(
    formattedOrder,
    {
      maxQty,
    },
  );

  const setOrderValue = useCallback((key: keyof OrderlyOrder, value: any) => {
    setFormattedOrder((oldValue) => ({
      ...oldValue,
      [key]: value,
    }));
  }, []);

  const {
    order_price,
    order_quantity,
    trigger_price,
    activated_price,
    callback_value,
    callback_rate,
  } = formattedOrder;

  const isChanged =
    (order.price && order.price != order_price) ||
    (order.quantity && order.quantity != order_quantity) ||
    (order.trigger_price && order.trigger_price != trigger_price) ||
    // trailing stop fields
    (order.activated_price && order.activated_price != activated_price) ||
    (order.callback_value && order.callback_value != callback_value) ||
    (order.callback_rate && order.callback_rate * 100 != callback_rate);

  useEffect(() => {
    if (isChanged) {
      validate()
        .then((order) => {
          console.log("validate success", order);
        })
        .catch((err) => {
          console.log("validate error", err);
        });
    } else {
      clearErrors();
    }
  }, [
    isChanged,
    order_price,
    order_quantity,
    trigger_price,
    activated_price,
    callback_value,
    callback_rate,
  ]);

  return {
    markPrice,
    errors,
    validate,
    setOrderValue,
    formattedOrder,
    isChanged,
  };
};
