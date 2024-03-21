import { useEffect, useState } from "react";

import {
  API,
  AlgoOrderEntity,
  OrderSide,
  SDKError,
} from "@orderly.network/types";
import { UpdateOrderKey, calculateHelper } from "./utils";
import { useMutation } from "../../useMutation";
import { OrderFactory } from "../../services/orderCreator/factory";
import { AlgoOrderRootType } from "@orderly.network/types";
import { TPSLPositionOrderCreator } from "../../services/orderCreator/tpslPositionOrderCreator";
import { findTPSLFromOrder } from "../usePositionStream/utils";

export type ValidateError = {
  tp_tigger_price?: string | null;
  sl_tigger_price?: string | null;
  qty?: string | null;
};

export type ComputedAlgoOrder = Partial<
  AlgoOrderEntity<AlgoOrderRootType.TP_SL> & {
    /**
     * Computed take profit
     */
    tp_pnl: number;
    tp_offset: number;
    tp_offset_percentage: number;

    /**
     * Computed stop loss
     */
    sl_pnl: number;
    sl_offset: number;
    sl_offset_percentage: number;
  }
>;

/**
 * @hidden
 */
export const useTaskProfitAndStopLossInternal = (
  position: Partial<API.PositionTPSLExt> &
    Pick<API.PositionTPSLExt, "symbol" | "average_open_price">,
  options?: {
    defaultOrder?: API.AlgoOrder;
  }
): [
  ComputedAlgoOrder,
  {
    /**
     * Update the take profit and stop loss order, this will merge the new data with the old one
     */
    setValue: (key: UpdateOrderKey, value: number | string) => void;
    setValues: (values: Partial<ComputedAlgoOrder>) => void;
    /**
     * Submit the take profit and stop loss order
     */
    submit: () => Promise<void>;
    /**
     * Create the take profit and stop loss order, auto-detect the order type
     */
    create: () => Promise<void>;
    update: (orderId: string) => Promise<any>;
    error: ValidateError | null;
  }
] => {
  const [order, setOrder] = useState<ComputedAlgoOrder>({
    symbol: position.symbol,
    side: Number(position.position_qty) > 0 ? OrderSide.BUY : OrderSide.SELL,
    quantity: options?.defaultOrder?.quantity || position.position_qty,
    // tp_trigger_price: options?.defaultOrder?.tp_trigger_price,
    // sl_trigger_price: options?.defaultOrder?.sl_trigger_price,
  });

  const [doCreateOrder] = useMutation("/v1/algo/order");
  const [doUpdateOrder] = useMutation("/v1/algo/order", "PUT");
  const [doDeleteOrder] = useMutation("/v1/algo/order", "DELETE");

  const [error, setError] = useState<ValidateError | null>(null);

  useEffect(() => {
    if (!options?.defaultOrder) return;
    const trigger_prices = findTPSLFromOrder(options.defaultOrder!);
    if (trigger_prices.tp_trigger_price) {
      setOrderValue("tp_trigger_price", trigger_prices.tp_trigger_price);
    }
    if (trigger_prices.sl_trigger_price) {
      setOrderValue("sl_trigger_price", trigger_prices.sl_trigger_price);
    }
  }, []);

  const setOrderValue = (key: UpdateOrderKey, value: number | string) => {
    console.log("updateOrder", key, value);
    // if key is quantity;
    if (key === "quantity") {
      setOrder((prev) => ({ ...prev, quantity: value }));
      // TODO: calulate the tp and sl
      return;
    }

    const newValue = calculateHelper(key, {
      key,
      value,
      entryPrice: position.average_open_price!,
      qty: position.position_qty!,
      orderSide: position.position_qty! > 0 ? OrderSide.BUY : OrderSide.SELL,
    });
    setOrder((prev) => ({ ...prev, ...newValue }));
  };

  const setValues = (values: Partial<ComputedAlgoOrder>) => {
    const keys = Object.keys(values);
    keys.forEach((key) => {
      setOrderValue(
        key as UpdateOrderKey,
        values[key as keyof ComputedAlgoOrder] as number | string
      );
    });
  };

  const validate = (): ValidateError => {
    const errors: ValidateError = {};

    return errors;
  };

  useEffect(() => {
    setError(validate());
  }, [order]);

  const compare = (): boolean => {
    const quantityNum = Number(order.quantity);
    if (isNaN(quantityNum)) return false;
    return quantityNum === Number(position.position_qty);
  };

  const getOrderCreator = () => {
    return OrderFactory.create(
      compare() ? AlgoOrderRootType.POSITIONAL_TP_SL : AlgoOrderRootType.TP_SL
    );
  };

  const submit = async () => {
    const defaultOrder = options?.defaultOrder;
    const orderId = defaultOrder?.algo_order_id;
    const algoType = defaultOrder?.algo_type;

    // if algo_order_id is not existed, create new order
    if (!orderId) {
      return createOrder();
    }

    // if algo_order_id is existed and algoType = POSITION_TP_SL
    if (algoType === AlgoOrderRootType.POSITIONAL_TP_SL) {
      // if order.qty = position.qty, update order
      if (compare()) {
        return updateOrder(orderId!);
      }
      // if order.qty != position.qty, create new tp/sl order
      return createOrder();
    }

    // if algo_order_id is existed and algoType = TP_SL, delete order and create new order

    return updateOrder(orderId!);
  };

  const createOrder = () => {
    const orderCreator = getOrderCreator();

    const orderBody = orderCreator.create(
      order as AlgoOrderEntity<AlgoOrderRootType.TP_SL>
    );

    if (orderBody.child_orders.length === 0) {
      throw new SDKError("No child orders");
    }

    console.log("-----", orderBody, orderCreator);

    return doCreateOrder(orderBody);
  };

  const deleteOrder = (orderId: number, symbol: string): Promise<any> => {
    return doDeleteOrder(null, {
      order_id: orderId,
      symbol,
    });
  };

  const updateOrder = (orderId: number): Promise<any> => {
    const orderCreator = getOrderCreator() as TPSLPositionOrderCreator;

    const newOrder = orderCreator.crateUpdateOrder(
      order,
      options?.defaultOrder
    );

    const needDelete =
      newOrder.child_orders.filter(
        (order) =>
          typeof order.is_activated === "boolean" && !order.is_activated
      ).length === 2;

    if (needDelete) {
      return deleteOrder(orderId, order.symbol!);
    }

    return doUpdateOrder({
      order_id: orderId,
      ...newOrder,
    });
  };

  return [
    order,
    {
      submit,

      create: submit,

      update: updateOrder,
      setValue: setOrderValue,
      setValues,
      // createPositionTPSL: submit,
      // createTPSL: submit,

      error,
    },
  ];
};
