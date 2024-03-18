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
import { AlogOrderRootType } from "@orderly.network/types";

export type ValidateError = {
  tp_tigger_price?: string | null;
  sl_tigger_price?: string | null;
  qty?: string | null;
};

export type ComputedAlgoOrder = Partial<
  AlgoOrderEntity<AlogOrderRootType.TP_SL> & {
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
  options?: {}
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
    error: ValidateError | null;
  }
] => {
  const [order, setOrder] = useState<ComputedAlgoOrder>({
    symbol: position.symbol,
    side: Number(position.position_qty) > 0 ? OrderSide.BUY : OrderSide.SELL,
    quantity: position.position_qty,
  });

  const [submitOrder] = useMutation("/v1/algo/order");

  const [error, setError] = useState<ValidateError | null>(null);

  const updateOrder = (key: UpdateOrderKey, value: number | string) => {
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
      updateOrder(
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

  const submit = async () => {
    const orderCreator = OrderFactory.create(
      compare()
        ? AlogOrderRootType.POSITIONAL_TP_SL
        : AlogOrderRootType.POSITIONAL_TP_SL
    );
    const orderBody = orderCreator.create(
      order as AlgoOrderEntity<AlogOrderRootType.TP_SL>
    );

    console.log("-----", orderBody, orderCreator);

    return submitOrder(orderBody);
  };

  return [
    order,
    {
      submit,
      setValue: updateOrder,
      setValues,

      error,
    },
  ];
};
