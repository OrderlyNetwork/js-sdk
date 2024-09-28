import {
  OrderEntity,
  OrderType,
  OrderlyOrder,
  AlgoOrderType,
  ChildOrder,
  AlgoOrderRootType,
  AlgoOrderChildOrders,
  OrderSide,
} from "@orderly.network/types";
import {
  OrderCreator,
  OrderFormEntity,
  ValuesDepConfig,
  VerifyResult,
} from "./interface";
import { Decimal } from "@orderly.network/utils";
import { checkNotional } from "../../utils/createOrder";

export abstract class BaseOrderCreator<T> implements OrderCreator<T> {
  abstract create(values: T, config?: ValuesDepConfig): T;

  abstract validate(values: T, config: ValuesDepConfig): Promise<VerifyResult>;

  abstract orderType: OrderType;

  baseOrder(data: OrderlyOrder): OrderlyOrder {
    const order: Pick<
      OrderEntity,
      | "symbol"
      | "order_type"
      | "side"
      | "reduce_only"
      | "order_quantity"
      | "total"
      | "visible_quantity"
    > = {
      symbol: data.symbol!,
      order_type: data.order_type,
      side: data.side,
      reduce_only: data.reduce_only!,
      order_quantity: data.order_quantity!,
      total: data.total,
    };

    if (data.visible_quantity === 0) {
      order.visible_quantity = data.visible_quantity;
    }

    const bracketOrder = this.parseBracketOrder(data);

    if (!bracketOrder) {
      return order;
    }

    return {
      ...order,
      child_orders: bracketOrder,
    };
  }

  baseValidate(
    values: OrderFormEntity,
    configs: ValuesDepConfig
  ): Promise<VerifyResult> {
    const errors: {
      [P in keyof OrderEntity]?: { type: string; message: string };
    } = {};

    const { maxQty, symbol, markPrice } = configs;

    // @ts-ignore
    let { order_quantity, total, order_price, reduce_only, order_type } =
      values;

    const { min_notional } = symbol || {};

    if (!order_quantity) {
      // calculate order_quantity from total
      if (total && order_price) {
        const { quote_dp } = configs.symbol;
        const totalNumber = new Decimal(total);
        const qty = totalNumber.dividedBy(order_price).toFixed(quote_dp);
        order_quantity = qty;
      }
    }

    if (!order_quantity) {
      errors.order_quantity = {
        type: "required",
        message: "Quantity is required",
      };
    } else {
      // need to use MaxQty+base_max, base_min to compare
      const { base_min, quote_dp, base_dp } = configs.symbol;
      const qty = new Decimal(order_quantity);
      if (qty.lt(base_min)) {
        errors.order_quantity = {
          type: "min",
          message: `Quantity must be greater than ${new Decimal(base_min).todp(
            base_dp
          )}`,
        };
        // errors.order_quantity = `quantity must be greater than ${base_min}`;
      } else if (qty.gt(maxQty)) {
        errors.order_quantity = {
          type: "max",
          message: `Quantity must be less than ${new Decimal(maxQty).todp(
            base_dp
          )}`,
        };
      }
    }

    // remove total validation
    // if (!!total) {
    //   const { quote_max, quote_min, quote_dp } = configs.symbol;
    //   const totalNumber = new Decimal(total);
    //   if (totalNumber.lt(quote_min)) {
    //     errors.total = {
    //       type: "min",
    //       message: `Quantity must be at least ${new Decimal(quote_min).todp(
    //         quote_dp
    //       )}`,
    //     };
    //   } else if (totalNumber.gt(quote_max)) {
    //     errors.total = {
    //       type: "max",
    //       message: `Quantity should be less or equal than ${new Decimal(
    //         quote_max
    //       ).todp(quote_dp)}`,
    //     };
    //   }
    // }

    const price = `${order_type}`.includes("MARKET") ? markPrice : order_price;
    const notionalHintStr = checkNotional(price, order_quantity, min_notional);

    if (notionalHintStr !== undefined && !reduce_only) {
      errors.total = {
        type: "min",
        message: notionalHintStr,
      };
    }

    return Promise.resolve(errors);
  }

  totalToQuantity(
    order: {
      order_quantity?: number | string;
      total?: string | number;
      order_price?: string | number;
    },
    config: ValuesDepConfig
  ): OrderEntity {
    // if order_quantity is not set but total is set, calculate order_quantity from total
    if (!order.order_quantity && order.total && order.order_price) {
      const { base_dp } = config.symbol;
      const totalNumber = new Decimal(order.total);
      const qty = totalNumber.div(order.order_price).toDecimalPlaces(base_dp);
      order.order_quantity = qty.toNumber();

      delete order.total;
    }

    return order as OrderEntity;
  }

  get type(): OrderType {
    return this.orderType;
  }

  protected parseBracketOrder(data: OrderlyOrder): AlgoOrderChildOrders | null {
    const orders: ChildOrder[] = [];

    const side = data.side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;

    if (!!data.tp_trigger_price) {
      const tp_trigger_price = data.tp_trigger_price;

      orders.push({
        algo_type: AlgoOrderType.TAKE_PROFIT,
        side: side,
        type: OrderType.MARKET,
        trigger_price: tp_trigger_price,
        symbol: data.symbol,
        reduce_only: true,
      });
    }

    if (!!data.sl_trigger_price) {
      const sl_trigger_price = data.sl_trigger_price;

      orders.push({
        algo_type: AlgoOrderType.STOP_LOSS,
        side: side,
        type: OrderType.MARKET,
        trigger_price: sl_trigger_price,
        symbol: data.symbol,
        reduce_only: true,
      });
    }

    if (!orders.length) return null;

    return {
      symbol: data.symbol,
      algo_type: AlgoOrderRootType.POSITIONAL_TP_SL,
      child_orders: orders,
    };
  }
}
