import {
  AlgoOrderEntity,
  AlgoOrderType,
  OrderType,
  TriggerPriceType,
  AlgoOrderRootType,
  PositionType,
} from "@veltodefi/types";
import { OrderSide } from "@veltodefi/types";
import { API } from "@veltodefi/types";
import { Decimal } from "@veltodefi/utils";
import { AlgoOrderUpdateEntity, BaseAlgoOrderCreator } from "./baseAlgoCreator";
import { ValuesDepConfig } from "./interface";

export class TPSLPositionOrderCreator extends BaseAlgoOrderCreator<
  AlgoOrderEntity<AlgoOrderRootType.POSITIONAL_TP_SL>
> {
  type = AlgoOrderRootType.POSITIONAL_TP_SL as unknown as OrderType;

  create(
    values: AlgoOrderEntity<AlgoOrderRootType.POSITIONAL_TP_SL>,
    config: ValuesDepConfig,
  ) {
    const side =
      values.side! === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;

    const child_orders = [];

    if (typeof values.tp_trigger_price !== "undefined") {
      const tp_trigger_price = !!values.tp_trigger_price
        ? new Decimal(values.tp_trigger_price)
            .todp(config.symbol.quote_dp)
            .toNumber()
        : values.tp_trigger_price;

      const childOrderItem: any = {
        algo_type: AlgoOrderType.TAKE_PROFIT,
        reduce_only: true,
        side,
        type: values.tp_order_price
          ? OrderType.LIMIT
          : OrderType.CLOSE_POSITION,
        trigger_price: tp_trigger_price,
        trigger_price_type: TriggerPriceType.MARK_PRICE,
        symbol: values.symbol,
        is_activated: !!values.tp_trigger_price,
      };
      if (values.tp_order_price) {
        childOrderItem.type = OrderType.LIMIT;
        childOrderItem.price = new Decimal(values.tp_order_price)
          .todp(config.symbol.quote_dp)
          .toNumber();
      }

      child_orders.push(childOrderItem);
    }

    if (typeof values.sl_trigger_price !== "undefined") {
      const sl_trigger_price = !!values.sl_trigger_price
        ? new Decimal(values.sl_trigger_price)
            .todp(config.symbol.quote_dp)
            .toNumber()
        : values.sl_trigger_price;

      const childOrderItem: any = {
        algo_type: AlgoOrderType.STOP_LOSS,
        reduce_only: true,
        side,
        type: values.sl_order_price
          ? OrderType.LIMIT
          : OrderType.CLOSE_POSITION,
        trigger_price: sl_trigger_price,
        trigger_price_type: TriggerPriceType.MARK_PRICE,
        symbol: values.symbol,
        is_activated: !!values.sl_trigger_price,
      };
      if (values.sl_order_price) {
        childOrderItem.type = OrderType.LIMIT;
        childOrderItem.price = new Decimal(values.sl_order_price)
          .todp(config.symbol.quote_dp)
          .toNumber();
      }
      child_orders.push(childOrderItem);
    }

    return {
      algo_type:
        values.position_type === PositionType.FULL
          ? AlgoOrderRootType.POSITIONAL_TP_SL
          : AlgoOrderRootType.TP_SL,
      trigger_price_type: TriggerPriceType.MARK_PRICE,
      // reduce_only: true,
      symbol: values.symbol,
      child_orders,
    };
  }

  crateUpdateOrder(
    values: AlgoOrderEntity<AlgoOrderRootType.POSITIONAL_TP_SL>,
    /**
     * The old value of the order
     */
    oldValue: API.AlgoOrder,
    config: ValuesDepConfig,
  ): [
    { child_orders: AlgoOrderUpdateEntity[] },
    AlgoOrderEntity<AlgoOrderRootType.POSITIONAL_TP_SL>,
  ] {
    const data = this.create(values, config);
    const newData: {
      trigger_price?: number;
      order_id: number;
      is_activated?: boolean;
    }[] = [];
    data.child_orders.forEach((order) => {
      // find the old order

      const oldOrder = oldValue.child_orders?.find(
        (oldOrder) => oldOrder.algo_type === order.algo_type,
      );

      if (oldOrder) {
        if (!order.is_activated) {
          newData.push({
            is_activated: false,
            order_id: Number(oldOrder.algo_order_id),
          });
        } else if (oldOrder.trigger_price !== order.trigger_price) {
          newData.push({
            trigger_price: order.trigger_price as number,
            order_id: Number(oldOrder.algo_order_id),
          });
        }
      }
    });

    return [
      {
        child_orders: newData,
      },
      data,
    ];
  }
}
