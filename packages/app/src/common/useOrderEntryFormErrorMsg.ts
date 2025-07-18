import {
  OrderValidationItem,
  OrderValidationResult,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";

type Keys = keyof OrderValidationResult;
type ErrorType = Partial<OrderValidationItem["type"]>;

export function useOrderEntryFormErrorMsg(
  errors: OrderValidationResult | null,
) {
  const { t } = useTranslation();

  const getMessage = (key: Keys, type: ErrorType, value?: number | string) => {
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
        min: t("orderEntry.tpTriggerPrice.error.min", { value }),
        max: t("orderEntry.tpTriggerPrice.error.max", { value }),
      },
      sl_trigger_price: {
        min: t("orderEntry.slTriggerPrice.error.min", { value }),
        max: t("orderEntry.slTriggerPrice.error.max", { value }),
      },
      total: {
        min: t("orderEntry.total.error.min", { value }),
      },
      // not show form input tooltip
      // slippage: {
      //   max: t("orderEntry.slippage.error.max"),
      // },
      max_price: {
        required: t("orderEntry.upperPrice.error.required"),
        min: t("orderEntry.upperPrice.error.min", { value }),
        max: t("orderEntry.upperPrice.error.max", { value }),
      },
      min_price: {
        required: t("orderEntry.lowerPrice.error.required"),
        min: t("orderEntry.lowerPrice.error.min", { value }),
        // not use value
        max: t("orderEntry.lowerPrice.error.max"),
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
    };

    return map[key]?.[type] || "";
  };

  const parseErrorMsg = (key: Keys) => {
    const { type, value } = errors?.[key] || ({} as OrderValidationItem);
    if (type) {
      return getMessage(key, type, value);
    }
    return "";
  };

  return {
    parseErrorMsg,
  };
}
