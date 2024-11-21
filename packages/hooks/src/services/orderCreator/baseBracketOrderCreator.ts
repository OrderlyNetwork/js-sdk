import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  OrderSide,
} from "@orderly.network/types";
import { ValuesDepConfig, VerifyResult } from "./interface";
import { Decimal } from "@orderly.network/utils";
import { OrderType } from "@orderly.network/types";

export async function bracketOrderValidator<
  T extends AlgoOrderEntity<
    AlgoOrderRootType.POSITIONAL_TP_SL | AlgoOrderRootType.TP_SL
  >
>(values: Partial<T>, config: ValuesDepConfig): Promise<VerifyResult> {
  const result = Object.create(null);
  await Promise.resolve();
  const { tp_trigger_price, sl_trigger_price, side } = values;
  const qty = Number(values.quantity);
  const maxQty = config.maxQty;
  const type = values.order_type;
  const { quote_max, quote_min, price_scope, quote_dp } = config.symbol ?? {};

  const mark_price =
    type === OrderType.MARKET
      ? config.markPrice
      : values.order_price
      ? Number(values.order_price)
      : undefined;

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
  if (side === OrderSide.BUY && mark_price) {
    const slTriggerPriceScope = new Decimal(mark_price * (1 - price_scope))
      .toDecimalPlaces(quote_dp, Decimal.ROUND_DOWN)
      .toNumber();
    if (!!sl_trigger_price && Number(sl_trigger_price) < slTriggerPriceScope) {
      result.sl_trigger_price = {
        message: `SL price must be greater than ${slTriggerPriceScope}`,
      };
    }

    if (!!tp_trigger_price && Number(tp_trigger_price) <= mark_price) {
      result.tp_trigger_price = {
        message: `TP price must be greater than ${mark_price}`,
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
    if (!!sl_trigger_price && Number(sl_trigger_price) > slTriggerPriceScope) {
      result.sl_trigger_price = {
        message: `SL price must be less than ${slTriggerPriceScope}`,
      };
    }

    if (!!tp_trigger_price && Number(tp_trigger_price) >= mark_price) {
      result.tp_trigger_price = {
        message: `TP price must be less than ${mark_price}`,
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
}
