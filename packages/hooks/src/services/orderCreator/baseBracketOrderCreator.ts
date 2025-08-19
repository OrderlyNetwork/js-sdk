import {
  AlgoOrderEntity,
  AlgoOrderRootType,
  OrderSide,
} from "@orderly.network/types";
import { OrderType } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import {
  getPriceRange,
  getTPSLTriggerPriceRange,
  getTPSLTriggerPriceScope,
} from "../../utils/order/orderPrice";
import { ValuesDepConfig, OrderValidationResult } from "./interface";
import { OrderValidation } from "./orderValidation";

const formatPrice = (price: number, quote_dp: number) => {
  return new Decimal(price).toDecimalPlaces(quote_dp).toNumber();
};

export async function bracketOrderValidator<
  T extends AlgoOrderEntity<
    AlgoOrderRootType.POSITIONAL_TP_SL | AlgoOrderRootType.TP_SL
  >,
>(values: Partial<T>, config: ValuesDepConfig): Promise<OrderValidationResult> {
  const result: OrderValidationResult = Object.create(null);
  await Promise.resolve();
  const {
    tp_enable,
    tp_trigger_price,
    tp_order_price,
    tp_order_type,
    sl_trigger_price,
    sl_enable,
    sl_order_price,
    sl_order_type,
    side,
  } = values;
  const qty = Number(values.quantity);
  const maxQty = config.maxQty;
  const type = values.order_type;
  const { quote_max, quote_min, quote_dp } = config.symbol ?? {};

  const mark_price =
    type === OrderType.MARKET
      ? config.markPrice
      : values.order_price
        ? Number(values.order_price)
        : undefined;
  const tpslSide = side === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;

  if (!isNaN(qty) && qty > maxQty) {
    result.quantity = OrderValidation.max("quantity", config.maxQty);
  }
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

  // there need use position side to validate
  // so if order's side is buy, then position's side is sell
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
      const priceRange = getPriceRange({
        side: tpslSide,
        basePrice: Number(sl_trigger_price),
        symbolInfo: config.symbol,
      });
      if (Number(sl_order_price) < priceRange.minPrice) {
        result.sl_order_price = OrderValidation.min(
          "sl_order_price",
          formatPrice(priceRange.minPrice, quote_dp),
        );
      }
      if (Number(sl_order_price) > priceRange.maxPrice) {
        result.sl_order_price = OrderValidation.max(
          "sl_order_price",
          formatPrice(priceRange.maxPrice, quote_dp),
        );
      }
      // FE limit the buy order sl_order_price less than sl_trigger_price
      if (Number(sl_trigger_price) < Number(sl_order_price)) {
        result.sl_trigger_price =
          OrderValidation.priceErrorMax("sl_trigger_price");
      }
    }
    if (tp_trigger_price && tp_order_price) {
      const priceRange = getPriceRange({
        side: tpslSide,
        basePrice: Number(tp_trigger_price),
        symbolInfo: config.symbol,
      });
      if (Number(tp_order_price) > priceRange.maxPrice) {
        result.tp_order_price = OrderValidation.max(
          "tp_order_price",
          formatPrice(priceRange.maxPrice, quote_dp),
        );
      }
      // FE limit the buy order tp_order_price greater than tp_trigger_price
      if (Number(tp_order_price) < priceRange.minPrice) {
        result.tp_order_price = OrderValidation.min(
          "tp_order_price",
          formatPrice(priceRange.minPrice, quote_dp),
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
      const priceRange = getPriceRange({
        side: tpslSide,
        basePrice: Number(sl_trigger_price),
        symbolInfo: config.symbol,
      });
      console.log("sell order sl price range", {
        priceRange,
      });

      if (Number(sl_order_price) < priceRange.minPrice) {
        result.sl_order_price = OrderValidation.min(
          "sl_order_price",
          formatPrice(priceRange.minPrice, quote_dp),
        );
      }
      if (Number(sl_order_price) > priceRange.maxPrice) {
        result.sl_order_price = OrderValidation.max(
          "sl_order_price",
          formatPrice(priceRange.maxPrice, quote_dp),
        );
      }

      if (Number(sl_trigger_price) > Number(sl_order_price)) {
        result.sl_trigger_price =
          OrderValidation.priceErrorMin("sl_trigger_price");
      }
    }
    if (tp_trigger_price && tp_order_price) {
      const priceRange = getPriceRange({
        side: tpslSide,
        basePrice: Number(tp_trigger_price),
        symbolInfo: config.symbol,
      });
      if (Number(tp_order_price) < priceRange.minPrice) {
        result.tp_order_price = OrderValidation.min(
          "tp_order_price",
          formatPrice(priceRange.minPrice, quote_dp),
        );
      }
      if (Number(tp_order_price) > priceRange.maxPrice) {
        result.tp_order_price = OrderValidation.max(
          "tp_order_price",
          formatPrice(priceRange.maxPrice, quote_dp),
        );
      }
      if (Number(tp_trigger_price) < Number(tp_order_price)) {
        result.tp_trigger_price =
          OrderValidation.priceErrorMax("tp_trigger_price");
      }
    }
  }
  return Object.keys(result).length > 0 ? result : null!;
}
