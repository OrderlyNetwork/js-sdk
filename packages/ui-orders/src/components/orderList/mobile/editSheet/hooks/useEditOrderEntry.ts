import { useCallback, useEffect, useState } from "react";
import { useOrderEntity } from "@orderly.network/hooks";
import { API, OrderlyOrder, OrderSide } from "@orderly.network/types";

export const useEditOrderEntry = (props: {
  order: API.AlgoOrderExt;
  orderType: string;
  maxQty: number;
}) => {
  const { order, orderType, maxQty } = props;

  const [formattedOrder, setFormattedOrder] = useState({
    symbol: order.symbol,
    side: order.side as OrderSide,
    reduce_only: order.reduce_only,
    order_type: orderType,
    order_price: order.price,
    order_quantity: order.quantity,
    trigger_price: order.trigger_price,
    activated_price: order.activated_price,
    callback_value: order.callback_value,
    callback_rate: order.callback_rate ? order.callback_rate * 100 : undefined,
  });

  const { markPrice, errors, validate } = useOrderEntity(formattedOrder, {
    maxQty,
  });

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
    order.price != order_price ||
    order.quantity != order_quantity ||
    order.trigger_price != trigger_price ||
    // trailing stop fields
    order.activated_price != activated_price ||
    order.callback_value != callback_value ||
    order.callback_rate != callback_rate;

  useEffect(() => {
    validate()
      .then((order) => {
        console.log("validate success", order);
      })
      .catch((err) => {
        console.log("validate error", err);
      });
  }, [
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
