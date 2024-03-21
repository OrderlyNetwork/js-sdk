import {
  OrderEntity,
  AlgoOrderEntry,
  OrderType,
  API,
} from "@orderly.network/types";
import { BaseOrderCreator } from "./baseCreator";
import { ValuesDepConfig, OrderFormEntity, VerifyResult } from "./interface";
import { TriggerPriceType } from "@orderly.network/types";
import { AlgoOrderType } from "@orderly.network/types";
import { AlgoOrderRootType } from "@orderly.network/types/src/order";
import { OrderSide } from "@orderly.network/types";

export class TPSLOrderCreator extends BaseOrderCreator<
  AlgoOrderEntry<AlgoOrderRootType.TP_SL>
> {
  create(
    values: AlgoOrderEntry<AlgoOrderRootType.TP_SL>
    // config: ValuesDepConfig
  ) {
    const side =
      values.side! === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;

    const child_orders = [];

    if (values.tp_trigger_price) {
      child_orders.push({
        algo_type: AlgoOrderType.TAKE_PROFIT,
        reduce_only: true,
        side,
        type: OrderType.MARKET,
        trigger_price: values.tp_trigger_price,
        symbol: values.symbol,
        is_activated: !!values.tp_trigger_price,
      });
    }

    if (values.sl_trigger_price) {
      child_orders.push({
        algo_type: AlgoOrderType.STOP_LOSS,
        reduce_only: true,
        side,
        type: OrderType.MARKET,
        trigger_price: values.sl_trigger_price,
        symbol: values.symbol,
        is_activated: !!values.sl_trigger_price,
      });
    }

    return {
      algo_type: AlgoOrderRootType.TP_SL,
      trigger_price_type: TriggerPriceType.MARK_PRICE,
      reduce_only: true,
      quantity: values.quantity,
      symbol: values.symbol,
      child_orders,
    };
  }

  crateUpdateOrder(
    values: AlgoOrderEntry<AlgoOrderRootType.TP_SL>,
    oldValue: API.AlgoOrder
  ) {
    const data = this.create(values);
    const newData: {
      trigger_price?: number;
      order_id: number;
      quantity?: number;
      is_activated?: boolean;
    }[] = [];

    const needUpdateQty = values.quantity !== oldValue.quantity;

    data.child_orders.forEach((order) => {
      // find the old order
      let _order = Object.create(null);

      if (needUpdateQty) {
        _order["quantity"] = data.quantity;
      }

      const oldOrder = oldValue.child_orders?.find(
        (oldOrder) => oldOrder.algo_type === order.algo_type
      );

      if (oldOrder) {
        if (!order.is_activated) {
          _order["is_activated"] = false;
        } else if (oldOrder.trigger_price !== order.trigger_price) {
          // _order["order_id"] = Number(oldOrder.algo_order_id);
          _order["trigger_price"] = order.trigger_price as number;
        }

        if (Object.keys(_order).length > 0) {
          _order["order_id"] = Number(oldOrder.algo_order_id);
          newData.push(_order);
        }
      }
    });

    return {
      child_orders: newData,
    };
  }

  validate(
    values: OrderFormEntity,
    config: ValuesDepConfig
  ): Promise<VerifyResult> {
    throw new Error("Method not implemented.");
  }
}
