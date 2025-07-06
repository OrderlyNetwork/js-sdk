import {
  OrderEntity,
  OrderType,
  OrderlyOrder,
  AlgoOrderType,
  ChildOrder,
  AlgoOrderRootType,
  AlgoOrderChildOrders,
  OrderSide,
  PositionType,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { getMinNotional } from "../../utils/createOrder";
import {
  OrderCreator,
  ValuesDepConfig,
  OrderValidationItem,
  OrderValidationResult,
} from "./interface";
import { OrderValidation } from "./orderValidation";

export abstract class BaseOrderCreator<T> implements OrderCreator<T> {
  abstract create(values: T, config?: ValuesDepConfig): T;

  abstract validate(
    values: T,
    config: ValuesDepConfig,
  ): Promise<OrderValidationResult>;

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
      | "slippage"
    > = {
      symbol: data.symbol!,
      order_type:
        data.order_type === OrderType.LIMIT
          ? !!data.order_type_ext
            ? data.order_type_ext
            : data.order_type
          : data.order_type,
      side: data.side,
      reduce_only: data.reduce_only!,
      order_quantity: data.order_quantity!,
      total: data.total,
      // slippage: data.slippage,
    };

    if (data.order_type === OrderType.MARKET && !!data.slippage) {
      order.slippage = new Decimal(data.slippage).div(100).toNumber();
    }

    if (data.visible_quantity === 0) {
      order.visible_quantity = data.visible_quantity;
    }

    const bracketOrder = this.parseBracketOrder(data);

    if (!bracketOrder) {
      return order;
    }

    return {
      ...order,
      algo_type: AlgoOrderRootType.BRACKET,

      child_orders: [bracketOrder],
    };
  }

  baseValidate(
    values: OrderlyOrder,
    configs: ValuesDepConfig,
  ): Promise<OrderValidationResult> {
    const errors: {
      [P in keyof OrderEntity]?: OrderValidationItem;
    } = {};

    const { maxQty, symbol, markPrice } = configs;

    // @ts-ignore
    let { order_quantity, total, order_price, reduce_only, order_type } =
      values;

    const { min_notional, base_tick, quote_dp, quote_tick, base_dp } =
      symbol || {};

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
      errors.order_quantity = OrderValidation.required("order_quantity");
    } else {
      // need to use MaxQty+base_max, base_min to compare
      const { base_min, quote_dp, base_dp } = configs.symbol;
      const qty = new Decimal(order_quantity);
      if (qty.lt(base_min)) {
        errors.order_quantity = OrderValidation.min(
          "order_quantity",
          new Decimal(base_min).todp(base_dp).toString(),
        );
      } else if (qty.gt(maxQty)) {
        errors.order_quantity = OrderValidation.max(
          "order_quantity",
          new Decimal(maxQty).todp(base_dp).toString(),
        );
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
    const minNotional = getMinNotional({
      base_tick,
      quote_tick,
      price,
      qty: order_quantity,
      min_notional,
      quote_dp,
      base_dp,
    });

    if (minNotional !== undefined && !reduce_only) {
      errors.total = {
        type: "min",
        message: `The order value should be greater or equal to ${minNotional} USDC`,
        value: minNotional,
      };
    }

    this.validateBracketOrder(values, configs, errors);

    return Promise.resolve(errors);
  }

  totalToQuantity(
    order: {
      order_quantity?: number | string;
      total?: string | number;
      order_price?: string | number;
    },
    config: ValuesDepConfig,
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

  protected getChildOrderType(
    positionType?: PositionType,
    orderPrice?: string,
  ): OrderType {
    if (positionType === PositionType.FULL) {
      return OrderType.CLOSE_POSITION;
    }
    let type = OrderType.MARKET;
    if (orderPrice) {
      type = OrderType.LIMIT;
    }
    return type;
  }

  protected parseBracketOrder(data: OrderlyOrder): AlgoOrderChildOrders | null {
    const orders: ChildOrder[] = [];

    const side = data.side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
    const algoType: AlgoOrderRootType =
      data.position_type === PositionType.PARTIAL
        ? AlgoOrderRootType.TP_SL
        : AlgoOrderRootType.POSITIONAL_TP_SL;
    if (!!data.tp_trigger_price) {
      const tp_trigger_price = data.tp_trigger_price;
      const orderItem: ChildOrder = {
        algo_type: AlgoOrderType.TAKE_PROFIT,
        side: side,
        // TODO need confirm child order type
        type: this.getChildOrderType(data.position_type, data.tp_order_price),
        trigger_price: tp_trigger_price,
        symbol: data.symbol,
        reduce_only: true,
      };
      if (data.tp_order_price) {
        orderItem.price = data.tp_order_price;
      }

      orders.push(orderItem);
    }

    if (!!data.sl_trigger_price) {
      const sl_trigger_price = data.sl_trigger_price;
      const orderItem: ChildOrder = {
        algo_type: AlgoOrderType.STOP_LOSS,
        side: side,
        // TODO need confirm child order type
        type: this.getChildOrderType(data.position_type, data.sl_order_price),
        trigger_price: sl_trigger_price,
        symbol: data.symbol,
        reduce_only: true,
      };

      if (data.sl_order_price) {
        orderItem.price = data.sl_order_price;
      }

      orders.push(orderItem);
    }

    if (!orders.length) return null;

    return {
      symbol: data.symbol,
      algo_type: algoType,
      child_orders: orders,
    };
  }

  private validateBracketOrder(
    values: OrderlyOrder,
    config: ValuesDepConfig,
    errors: {
      [P in keyof OrderlyOrder]?: OrderValidationItem;
    },
  ) {
    const { tp_trigger_price, sl_trigger_price, side, order_price } = values;
    const { markPrice } = config;

    if (!tp_trigger_price && !sl_trigger_price) return errors;

    const hasTPPrice = !!tp_trigger_price;
    const hasSLPrice = !!sl_trigger_price;
    const { symbol } = config;
    const { price_range, price_scope, quote_max, quote_min, quote_dp } = symbol;
    const _orderPrice = order_price || markPrice;

    if (hasTPPrice) {
      const tpPrice = new Decimal(tp_trigger_price);
      if (tpPrice.gt(quote_max)) {
        errors.tp_trigger_price = OrderValidation.max(
          "tp_trigger_price",
          quote_max,
        );
      }
      if (tpPrice.lt(quote_min)) {
        errors.tp_trigger_price = OrderValidation.min(
          "tp_trigger_price",
          quote_min,
        );
      }

      if (side === OrderSide.BUY) {
        if (tpPrice.lte(_orderPrice)) {
          errors.tp_trigger_price = OrderValidation.min(
            "tp_trigger_price",
            _orderPrice,
          );
        }
      }

      if (side === OrderSide.SELL) {
        if (tpPrice.gte(_orderPrice)) {
          errors.tp_trigger_price = OrderValidation.max(
            "tp_trigger_price",
            _orderPrice,
          );
        }
      }
    }

    if (hasSLPrice) {
      const slPrice = new Decimal(sl_trigger_price);
      if (slPrice.gt(quote_max)) {
        errors.sl_trigger_price = OrderValidation.max(
          "sl_trigger_price",
          quote_max,
        );
      }
      if (slPrice.lt(quote_min)) {
        errors.sl_trigger_price = OrderValidation.min(
          "sl_trigger_price",
          quote_min,
        );
      }

      if (side === OrderSide.BUY) {
        if (slPrice.gte(_orderPrice)) {
          errors.sl_trigger_price = OrderValidation.max(
            "sl_trigger_price",
            _orderPrice,
          );
        }
        //SL price < mark_price * price_scope
      }

      if (side === OrderSide.SELL) {
        if (slPrice.lte(_orderPrice)) {
          errors.sl_trigger_price = OrderValidation.min(
            "sl_trigger_price",
            _orderPrice,
          );
        }
      }
    }

    // if (side === OrderSide.BUY && hasTPPrice && hasSLPrice) {
    //   const slPrice = new Decimal(sl_trigger_price);
    //   const tpPrice = new Decimal(tp_trigger_price);

    //   if (tpPrice.lte(_orderPrice)) {
    //     errors.tp_trigger_price = OrderValidation.min(
    //       "tp_trigger_price",
    //       _orderPrice
    //     );
    //   }
    //   if (slPrice.gte(_orderPrice)) {
    //     errors.sl_trigger_price = OrderValidation.max(
    //       "sl_trigger_price",
    //       _orderPrice
    //     );
    //   }

    //   const slPriceScope = slPrice
    //     .mul(1 - price_scope)
    //     .toDecimalPlaces(quote_dp, Decimal.ROUND_DOWN)
    //     .toNumber();

    //   if (slPrice.lt(slPriceScope)) {
    //     errors.sl_trigger_price = OrderValidation.max(
    //       "sl_trigger_price",
    //       slPriceScope
    //     );
    //   }
    // } else if (side === OrderSide.SELL && hasTPPrice && hasSLPrice) {
    //   const slPrice = new Decimal(sl_trigger_price);
    //   const tpPrice = new Decimal(tp_trigger_price);

    //   if (tpPrice.gte(_orderPrice)) {
    //     errors.tp_trigger_price = OrderValidation.max(
    //       "tp_trigger_price",
    //       _orderPrice
    //     );
    //   }

    //   if (slPrice.lte(_orderPrice)) {

    //   }
    // }

    return errors;
  }
}
