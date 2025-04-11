import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import {
  OrderCreator,
  ValuesDepConfig,
  OrderValidationItem,
} from "./interface";
import { Decimal } from "@orderly.network/utils";
import { OrderValidation } from "./orderValidation";

export type AlgoOrderUpdateEntity = {
  trigger_price?: number;
  order_id: number;
  quantity?: number;
  is_activated?: boolean;
};

export abstract class BaseAlgoOrderCreator<
  T extends AlgoOrderEntity<
    AlgoOrderRootType.POSITIONAL_TP_SL | AlgoOrderRootType.TP_SL
  >
> implements OrderCreator<T>
{
  abstract create(values: T, config: ValuesDepConfig): T;

  /**
   * base validate
   */
  validate(
    values: Partial<T>,
    config: ValuesDepConfig
  ): Promise<{
    [P in keyof T]?: OrderValidationItem;
  }> {
    const result: {
      [P in keyof T]?: OrderValidationItem;
    } = Object.create(null);

    return Promise.resolve().then(() => {
      const { tp_trigger_price, sl_trigger_price, side } = values;

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
      if (side === OrderSide.BUY && mark_price) {
        const slTriggerPriceScope = new Decimal(mark_price * (1 - price_scope))
          .toDecimalPlaces(quote_dp, Decimal.ROUND_DOWN)
          .toNumber();
        if (
          !!sl_trigger_price &&
          Number(sl_trigger_price) < slTriggerPriceScope
        ) {
          result.sl_trigger_price = OrderValidation.min(
            "sl_trigger_price",
            slTriggerPriceScope
          );
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) > config.markPrice) {
          result.sl_trigger_price = OrderValidation.max(
            "sl_trigger_price",
            config.markPrice
          );
        }

        if (
          !!tp_trigger_price &&
          Number(tp_trigger_price) <= config.markPrice
        ) {
          result.tp_trigger_price = OrderValidation.min(
            "tp_trigger_price",
            config.markPrice
          );
        }

        if (!!tp_trigger_price && Number(tp_trigger_price) > quote_max) {
          result.tp_trigger_price = OrderValidation.max(
            "tp_trigger_price",
            quote_max
          );
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) < quote_min) {
          result.sl_trigger_price = OrderValidation.min(
            "sl_trigger_price",
            quote_min
          );
        }
      }

      if (side === OrderSide.SELL && mark_price) {
        const slTriggerPriceScope = new Decimal(mark_price * (1 + price_scope))
          .toDecimalPlaces(quote_dp, Decimal.ROUND_DOWN)
          .toNumber();
        if (
          !!sl_trigger_price &&
          Number(sl_trigger_price) > slTriggerPriceScope
        ) {
          result.sl_trigger_price = OrderValidation.max(
            "sl_trigger_price",
            slTriggerPriceScope
          );
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) < config.markPrice) {
          result.sl_trigger_price = OrderValidation.min(
            "sl_trigger_price",
            config.markPrice
          );
        }

        if (
          !!tp_trigger_price &&
          Number(tp_trigger_price) >= config.markPrice
        ) {
          result.tp_trigger_price = OrderValidation.max(
            "tp_trigger_price",
            config.markPrice
          );
        }

        if (!!tp_trigger_price && Number(tp_trigger_price) > quote_max) {
          result.tp_trigger_price = OrderValidation.max(
            "tp_trigger_price",
            quote_max
          );
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) < quote_min) {
          result.sl_trigger_price = OrderValidation.min(
            "sl_trigger_price",
            quote_min
          );
        }
      }

      return Object.keys(result).length > 0 ? result : null!;
    });
  }

  abstract get type(): OrderType;
}
