import {
  AlgoOrderEntity,
  OrderType,
  API,
  ChildOrder,
} from "@veltodefi/types";
import { TriggerPriceType } from "@veltodefi/types";
import { AlgoOrderType } from "@veltodefi/types";
import { AlgoOrderRootType } from "@veltodefi/types";
import { OrderSide } from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";
import { AlgoOrderUpdateEntity, BaseAlgoOrderCreator } from "./baseAlgoCreator";
import { ValuesDepConfig } from "./interface";

export class TPSLOrderCreator extends BaseAlgoOrderCreator<
  AlgoOrderEntity<AlgoOrderRootType.TP_SL>
> {
  type = OrderType.MARKET;

  create(
    values: AlgoOrderEntity<AlgoOrderRootType.TP_SL>,
    config: ValuesDepConfig,
  ) {
    const side =
      values.side! === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;

    const child_orders = [];

    if (values.tp_trigger_price) {
      const tp_trigger_price = !!values.tp_trigger_price
        ? new Decimal(values.tp_trigger_price)
            .todp(config.symbol.quote_dp)
            .toNumber()
        : values.tp_trigger_price;

      const orderItem: any = {
        algo_type: AlgoOrderType.TAKE_PROFIT,
        reduce_only: true,
        side,
        type: OrderType.MARKET,
        trigger_price: new Decimal(tp_trigger_price).toNumber(),
        symbol: values.symbol,
        is_activated: !!values.tp_trigger_price,
      };
      if (values.tp_order_price) {
        orderItem.price = new Decimal(values.tp_order_price).toNumber();
        orderItem.type = OrderType.LIMIT;
      }

      child_orders.push(orderItem);
    }

    if (values.sl_trigger_price) {
      const sl_trigger_price = !!values.sl_trigger_price
        ? new Decimal(values.sl_trigger_price)
            .todp(config.symbol.quote_dp)
            .toNumber()
        : values.sl_trigger_price;
      const orderItem: any = {
        algo_type: AlgoOrderType.STOP_LOSS,
        reduce_only: true,
        side,
        type: OrderType.MARKET,
        trigger_price: new Decimal(sl_trigger_price).toNumber(),
        symbol: values.symbol,
        is_activated: !!values.sl_trigger_price,
      };
      if (values.sl_order_price) {
        orderItem.price = new Decimal(values.sl_order_price).toNumber();
        orderItem.type = OrderType.LIMIT;
      }
      child_orders.push(orderItem);
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
    values: AlgoOrderEntity<AlgoOrderRootType.TP_SL>,
    oldValue: API.AlgoOrder,
    config: ValuesDepConfig,
  ): [
    { child_orders: AlgoOrderUpdateEntity[] },
    AlgoOrderEntity<AlgoOrderRootType.TP_SL>,
  ] {
    const data = this.create(values, config);
    const newData: AlgoOrderUpdateEntity[] = [];

    const needUpdateQty = values.quantity !== oldValue.quantity;
    console.log("create update order", {
      data,
      needUpdateQty,
      values,
      oldValue,
    });

    data.child_orders.forEach((order) => {
      // find the old order
      const _order = Object.create(null);

      if (needUpdateQty) {
        _order["quantity"] = data.quantity;
      }

      const oldOrder = oldValue.child_orders?.find(
        (oldOrder) => oldOrder.algo_type === order.algo_type,
      );

      // if the oldValue is single order, also have two child order.
      if (oldOrder) {
        if (!order.is_activated) {
          _order["is_activated"] = false;
        } else {
          if (oldOrder.trigger_price !== order.trigger_price) {
            // _order["order_id"] = Number(oldOrder.algo_order_id);
            _order["trigger_price"] = order.trigger_price;
          }
          if (
            oldOrder.price !== order.price &&
            order.type === OrderType.LIMIT
          ) {
            _order["price"] = order.price;
            // _order["type"] = OrderType.LIMIT;
          }
        }

        _order["order_id"] = Number(oldOrder.algo_order_id);
        newData.push(_order);
      }
    });

    if (newData.length < 2) {
      // if quantity is changed, need to update all child orders
      const missingOrders = oldValue.child_orders.filter(
        (order) => order.algo_order_id !== newData[0].order_id,
      );
      console.log("missingOrders", missingOrders);

      if (missingOrders.length) {
        const _data: AlgoOrderUpdateEntity = {
          is_activated: false,
          order_id: missingOrders[0].algo_order_id,
        };
        if (needUpdateQty) {
          _data.quantity = Number(data.quantity);
        }
        newData.push(_data);
      }
    }

    return [
      {
        child_orders: newData,
      },
      data,
    ];
  }
}
