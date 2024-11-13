import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import {
  OrderCreator,
  OrderFormEntity,
  ValuesDepConfig,
  VerifyResult,
} from "./interface";
// import { values } from "ramda";
// import { config } from "@swc/core/spack";
// import { maxQty } from "@orderly.network/perp";
import { Decimal } from "@orderly.network/utils";

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
    [P in keyof T]?: {
      type: string;
      message: string;
    };
  }> {
    const result = Object.create(null);
    return Promise.resolve().then(() => {
      const { tp_trigger_price, sl_trigger_price, side } = values;

      const qty = Number(values.quantity);
      const maxQty = config.maxQty;
      const orderType = values.order_type;
      const { quote_max, quote_min, price_scope, quote_dp } =
        config.symbol ?? {};
      if (!isNaN(qty) && qty > maxQty) {
        result.quantity = {
          message: `Quantity must be less than ${config.maxQty}`,
        };
      }

      if (Number(tp_trigger_price) < 0) {
        result.tp_trigger_price = {
          message: `TP Price must be greater than 0`,
        };
      }

      if (Number(sl_trigger_price) < 0) {
        result.sl_trigger_price = {
          message: `SL Price must be greater than 0`,
        };
      }

      const mark_price =
    orderType === OrderType.MARKET || orderType == null
      ? config.markPrice
      : values.order_price
      ? Number(values.order_price)
      : undefined;

      

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
          result.sl_trigger_price = {
            message: `SL price must be greater than ${slTriggerPriceScope}`,
          };
        }
        
        if (
          !!sl_trigger_price &&
          Number(sl_trigger_price) > config.markPrice
        ) {
          result.sl_trigger_price = {
            message: `SL price must be less than ${config.markPrice}`,
          };
        }

        if (
          !!tp_trigger_price &&
          Number(tp_trigger_price) <= config.markPrice
        ) {
          result.tp_trigger_price = {
            message: `TP price must be greater than ${config.markPrice}`,
          };
        }

        if (!!tp_trigger_price && Number(tp_trigger_price) > quote_max) {
          result.tp_trigger_price = {
            message: `TP price must be less than ${quote_max}`,
          };
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) < quote_min) {
          result.sl_trigger_price = {
            message: `TP price must be greater than ${quote_min}`,
          };
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
          result.sl_trigger_price = {
            message: `SL price must be less than ${slTriggerPriceScope}`,
          };
        }

        if (
          !!sl_trigger_price &&
          Number(sl_trigger_price) < config.markPrice
        ) {
          result.sl_trigger_price = {
            message: `SL price must be greater than ${config.markPrice}`,
          };
        }

        if (
          !!tp_trigger_price &&
          Number(tp_trigger_price) >= config.markPrice
        ) {
          result.tp_trigger_price = {
            message: `TP price must be less than ${config.markPrice}`,
          };
        }

        if (!!tp_trigger_price && Number(tp_trigger_price) > quote_max) {
          result.tp_trigger_price = {
            message: `TP price must be less than ${quote_max}`,
          };
        }

        if (!!sl_trigger_price && Number(sl_trigger_price) < quote_min) {
          result.sl_trigger_price = {
            message: `TP price must be greater than ${quote_min}`,
          };
        }
      }

      return Object.keys(result).length > 0 ? result : null;
    });
  }

  abstract get type(): OrderType;
}
