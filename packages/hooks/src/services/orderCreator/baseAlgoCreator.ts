import { AlgoOrderEntity, OrderSide } from "@orderly.network/types";
import {
  OrderCreator,
  OrderFormEntity,
  ValuesDepConfig,
  VerifyResult,
} from "./interface";
import { AlgoOrderRootType } from "@orderly.network/types";

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

      // there need use position side to validate
      // so if order's side is buy, then position's side is sell
      if (side === OrderSide.BUY) {
        if (
          !!sl_trigger_price &&
          Number(sl_trigger_price) >= config.markPrice
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
      }

      if (side === OrderSide.SELL) {
        if (
          !!sl_trigger_price &&
          Number(sl_trigger_price) <= config.markPrice
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
      }

      return Object.keys(result).length > 0 ? result : null;
    });
  }
}
