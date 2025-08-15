import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import {
  getPriceRange,
  getTPSLTriggerPriceRange,
} from "../../utils/order/orderPrice";
import {
  OrderCreator,
  ValuesDepConfig,
  OrderValidationItem,
} from "./interface";
import { OrderValidation } from "./orderValidation";

export type AlgoOrderUpdateEntity = {
  trigger_price?: number;
  order_id: number;
  quantity?: number;
  is_activated?: boolean;
};

const formatPrice = (price: number, quote_dp: number) => {
  return new Decimal(price).toDecimalPlaces(quote_dp).toNumber();
};

export abstract class BaseAlgoOrderCreator<
  T extends AlgoOrderEntity<
    AlgoOrderRootType.POSITIONAL_TP_SL | AlgoOrderRootType.TP_SL
  >,
> implements OrderCreator<T>
{
  abstract create(values: T, config: ValuesDepConfig): T;

  /**
   * base validate
   */
  validate(
    values: Partial<T>,
    config: ValuesDepConfig,
  ): Promise<{
    [P in keyof T]?: OrderValidationItem;
  }> {
    const result: {
      [P in keyof T]?: OrderValidationItem;
    } = Object.create(null);

    return Promise.resolve().then(() => {
      const {
        tp_trigger_price,
        sl_trigger_price,
        side,
        tp_enable,
        sl_enable,
        tp_order_type,
        sl_order_type,
        tp_order_price,
        sl_order_price,
      } = values;
      const qty = Number(values.quantity);
      const maxQty = config.maxQty;
      const orderType = values.order_type;
      const {
        quote_max,
        quote_min,
        price_scope,
        quote_dp,
        base_min,
        min_notional,
      } = config.symbol ?? {};

      if (!isNaN(qty) && qty > maxQty) {
        result.quantity = OrderValidation.max("quantity", config.maxQty);
      }
      if (!isNaN(qty) && qty < base_min) {
        result.quantity = OrderValidation.min("quantity", base_min);
      }

      // if (!tp_trigger_price) {
      //   result.tp_trigger_price = {
      //     message: `TP price is required`,
      //   };
      // }

      // if (!sl_trigger_price) {
      //   result.tp_trigger_price = {
      //     message: `SL price is required`,
      //   };
      // }

      if (Number(tp_trigger_price) < 0) {
        result.tp_trigger_price = OrderValidation.min("tp_trigger_price", 0);
      }

      if (Number(sl_trigger_price) < 0) {
        result.sl_trigger_price = OrderValidation.min("sl_trigger_price", 0);
      }

      if (tp_enable && !tp_trigger_price) {
        result.tp_trigger_price = OrderValidation.required("tp_trigger_price");
      }
      if (sl_enable && !sl_trigger_price) {
        result.sl_trigger_price = OrderValidation.required("sl_trigger_price");
      }
      if (tp_order_type === OrderType.LIMIT && !tp_order_price) {
        result.tp_order_price = OrderValidation.required("tp_order_price");
      }
      if (sl_order_type === OrderType.LIMIT && !sl_order_price) {
        result.sl_order_price = OrderValidation.required("sl_order_price");
      }

      const mark_price =
        orderType === OrderType.MARKET || orderType == null
          ? config.markPrice
          : values.order_price
            ? Number(values.order_price)
            : undefined;

      // const notionalHintStr = checkNotional(mark_price, qty, min_notional);

      // console.log("check min notional", notionalHintStr);

      // if (!!notionalHintStr) {
      //   result.total = {
      //     type: "min",
      //     message: notionalHintStr,
      //   };
      // }

      // there need use position side to validate
      // so if order's side is buy, then position's side is sell
      const tpslSide = side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;
      if (side === OrderSide.BUY && mark_price) {
        if (!!sl_trigger_price && Number(sl_trigger_price) < quote_min) {
          result.sl_trigger_price = OrderValidation.min(
            "sl_trigger_price",
            formatPrice(quote_min, quote_dp),
          );
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) > mark_price) {
          result.sl_trigger_price = OrderValidation.max(
            "sl_trigger_price",
            formatPrice(mark_price, quote_dp),
          );
        }

        if (!!tp_trigger_price && Number(tp_trigger_price) <= mark_price) {
          result.tp_trigger_price = OrderValidation.min(
            "tp_trigger_price",
            formatPrice(mark_price, quote_dp),
          );
        }

        if (!!tp_trigger_price && Number(tp_trigger_price) > quote_max) {
          result.tp_trigger_price = OrderValidation.max(
            "tp_trigger_price",
            formatPrice(quote_max, quote_dp),
          );
        }

        if (sl_trigger_price && sl_order_price) {
          const slOrderPriceRange = getPriceRange({
            side: tpslSide,
            basePrice: Number(sl_trigger_price),
            symbolInfo: config.symbol,
          });
          if (Number(sl_order_price) < slOrderPriceRange.minPrice) {
            result.sl_order_price = OrderValidation.min(
              "sl_order_price",
              formatPrice(slOrderPriceRange.minPrice, quote_dp),
            );
          }
          if (Number(sl_order_price) > slOrderPriceRange.maxPrice) {
            result.sl_order_price = OrderValidation.max(
              "sl_order_price",
              formatPrice(slOrderPriceRange.maxPrice, quote_dp),
            );
          }
          if (Number(sl_trigger_price) < Number(sl_order_price)) {
            result.sl_trigger_price =
              OrderValidation.priceErrorMax("sl_trigger_price");
          }
        }
        if (tp_trigger_price && tp_order_price) {
          const tpOrderPriceRange = getPriceRange({
            side: tpslSide,
            basePrice: Number(tp_trigger_price),
            symbolInfo: config.symbol,
          });
          if (Number(tp_order_price) > tpOrderPriceRange.maxPrice) {
            result.tp_order_price = OrderValidation.max(
              "tp_order_price",
              formatPrice(tpOrderPriceRange.maxPrice, quote_dp),
            );
          }
          if (Number(tp_order_price) < tpOrderPriceRange.minPrice) {
            result.tp_order_price = OrderValidation.min(
              "tp_order_price",
              formatPrice(tpOrderPriceRange.minPrice, quote_dp),
            );
          }
          if (Number(tp_trigger_price) > Number(tp_order_price)) {
            result.tp_trigger_price =
              OrderValidation.priceErrorMin("tp_trigger_price");
          }
        }
      }

      if (side === OrderSide.SELL && mark_price) {
        if (!!sl_trigger_price && Number(sl_trigger_price) > quote_max) {
          result.sl_trigger_price = OrderValidation.max(
            "sl_trigger_price",
            formatPrice(quote_max, quote_dp),
          );
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) < mark_price) {
          result.sl_trigger_price = OrderValidation.min(
            "sl_trigger_price",
            formatPrice(mark_price, quote_dp),
          );
        }

        if (!!tp_trigger_price && Number(tp_trigger_price) >= mark_price) {
          result.tp_trigger_price = OrderValidation.max(
            "tp_trigger_price",
            formatPrice(mark_price, quote_dp),
          );
        }
        if (!!tp_trigger_price && Number(tp_trigger_price) < quote_min) {
          result.tp_trigger_price = OrderValidation.min(
            "tp_trigger_price",
            formatPrice(quote_min, quote_dp),
          );
        }

        if (sl_trigger_price && sl_order_price) {
          const slOrderPriceRange = getPriceRange({
            side: tpslSide,
            basePrice: Number(sl_trigger_price),
            symbolInfo: config.symbol,
          });
          if (Number(sl_order_price) < slOrderPriceRange.minPrice) {
            result.sl_order_price = OrderValidation.min(
              "sl_order_price",
              formatPrice(slOrderPriceRange.minPrice, quote_dp),
            );
          }
          if (Number(sl_order_price) > slOrderPriceRange.maxPrice) {
            result.sl_order_price = OrderValidation.max(
              "sl_order_price",
              formatPrice(slOrderPriceRange.maxPrice, quote_dp),
            );
          }
          if (Number(sl_trigger_price) > Number(sl_order_price)) {
            result.sl_trigger_price =
              OrderValidation.priceErrorMin("sl_trigger_price");
          }
        }
        if (tp_trigger_price && tp_order_price) {
          const tpOrderPriceRange = getPriceRange({
            side: tpslSide,
            basePrice: Number(tp_trigger_price),
            symbolInfo: config.symbol,
          });
          if (Number(tp_order_price) < tpOrderPriceRange.minPrice) {
            result.tp_order_price = OrderValidation.min(
              "tp_order_price",
              formatPrice(tpOrderPriceRange.minPrice, quote_dp),
            );
          }
          if (Number(tp_order_price) > tpOrderPriceRange.maxPrice) {
            result.tp_order_price = OrderValidation.max(
              "tp_order_price",
              formatPrice(tpOrderPriceRange.maxPrice, quote_dp),
            );
          }
          if (Number(tp_trigger_price) < Number(tp_order_price)) {
            result.tp_trigger_price =
              OrderValidation.priceErrorMax("tp_trigger_price");
          }
        }
      }

      return Object.keys(result).length > 0 ? result : null!;
    });
  }

  abstract get type(): OrderType;
}
