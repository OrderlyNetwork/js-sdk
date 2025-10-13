import { useCallback } from "react";
import {
  OrderValidationItem,
  OrderValidationResult,
} from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";

type Keys = keyof OrderValidationResult;
type ErrorType = Partial<OrderValidationItem["type"]>;

export function useOrderEntryFormErrorMsg(
  errors: OrderValidationResult | null,
) {
  const { t } = useTranslation();

  const getMessage = (
    key: Keys,
    type: ErrorType,
    params: {
      value?: string | number;
      min?: string | number;
      max?: string | number;
    },
  ) => {
    const { value, min, max } = params || {};
    const map: Partial<Record<Keys, Partial<Record<ErrorType, string>>>> = {
      quantity: {
        required: t("orderEntry.orderQuantity.error.required"),
        min: t("orderEntry.orderQuantity.error.min", { value }),
        max: t("orderEntry.orderQuantity.error.max", { value }),
      },
      order_quantity: {
        required: t("orderEntry.orderQuantity.error.required"),
        min: t("orderEntry.orderQuantity.error.min", { value }),
        max: t("orderEntry.orderQuantity.error.max", { value }),
      },
      order_price: {
        required: t("orderEntry.orderPrice.error.required"),
        min: t("orderEntry.orderPrice.error.min", { value }),
        max: t("orderEntry.orderPrice.error.max", { value }),
      },
      trigger_price: {
        required: t("orderEntry.triggerPrice.error.required"),
        min: t("orderEntry.triggerPrice.error.min", { value }),
        max: t("orderEntry.triggerPrice.error.max", { value }),
      },
      tp_trigger_price: {
        required: t("tpsl.validate.tpTriggerPrice.error.required"),
        min: t("orderEntry.tpTriggerPrice.error.min", { value }),
        max: t("orderEntry.tpTriggerPrice.error.max", { value }),
        priceErrorMin: t("tpsl.validate.tpTriggerPrice.error.priceErrorMin"),
        priceErrorMax: t("tpsl.validate.tpTriggerPrice.error.priceErrorMax"),
      },
      sl_trigger_price: {
        required: t("tpsl.validate.slTriggerPrice.error.required"),
        min: t("orderEntry.slTriggerPrice.error.min", { value }),
        max: t("orderEntry.slTriggerPrice.error.max", { value }),
        priceErrorMin: t("tpsl.validate.slTriggerPrice.error.priceErrorMin"),
        priceErrorMax: t("tpsl.validate.slTriggerPrice.error.priceErrorMax"),
      },
      tp_order_price: {
        required: t("tpsl.validate.tpOrderPrice.error.required"),
        min: t("tpsl.validate.tpOrderPrice.error.min", { value }),
        max: t("tpsl.validate.tpOrderPrice.error.max", { value }),
      },
      sl_order_price: {
        required: t("tpsl.validate.slOrderPrice.error.required"),
        min: t("tpsl.validate.slOrderPrice.error.min", { value }),
        max: t("tpsl.validate.slOrderPrice.error.max", { value }),
      },
      total: {
        min: t("orderEntry.total.error.min", { value }),
      },
      // not show form input tooltip
      // slippage: {
      //   max: t("orderEntry.slippage.error.max"),
      // },
      start_price: {
        required: t("orderEntry.startPrice.error.required"),
        min: t("orderEntry.startPrice.error.min", { value }),
        max: t("orderEntry.startPrice.error.max", { value }),
      },
      end_price: {
        required: t("orderEntry.endPrice.error.required"),
        min: t("orderEntry.endPrice.error.min", { value }),
        max: t("orderEntry.endPrice.error.max", { value }),
      },
      total_orders: {
        required: t("orderEntry.totalOrders.error.required"),
        range: t("orderEntry.totalOrders.error.range"),
      },
      skew: {
        required: t("orderEntry.skew.error.required"),
        min: t("orderEntry.skew.error.min", { value }),
        max: t("orderEntry.skew.error.max", { value }),
      },
      activated_price: {
        min: t("orderEntry.triggerPrice.error.min", { value }),
        max: t("orderEntry.triggerPrice.error.max", { value }),
      },
      callback_value: {
        required: t("orderEntry.callbackValue.error.required"),
        min: t("orderEntry.callbackValue.error.min", { value }),
        range: t("orderEntry.callbackValue.error.range", {
          min,
          max,
        }),
      },
      callback_rate: {
        required: t("orderEntry.callbackRate.error.required"),
        range: t("orderEntry.callbackRate.error.range", {
          min,
          max,
        }),
      },
    };

    return map[key]?.[type] || "";
  };

  const getErrorMsg = useCallback(
    (key: Keys, customValue?: string) => {
      const { type, value, min, max } = errors?.[key] || ({} as any);
      if (type) {
        return getMessage(key, type, { value: customValue || value, min, max });
      }
      return "";
    },
    [errors],
  );

  return {
    getErrorMsg,
  };
}
