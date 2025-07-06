import {
  OrderValidationItem,
  OrderValidationResult,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";

type Keys =
  | "quantity"
  | "order_quantity"
  | "order_price"
  | "trigger_price"
  | "total"
  | "tp_trigger_price"
  | "sl_trigger_price"
  | "tp_order_price"
  | "sl_order_price";

export function useOrderEntryFormErrorMsg(
  errors: OrderValidationResult | null,
) {
  const { t } = useTranslation();

  const getMessage = (
    key: Keys,
    value?: number | string,
    type?: OrderValidationItem["type"],
  ) => {
    const map = {
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
        required: "TP trigger price is required",
        min: t("orderEntry.tpTriggerPrice.error.min", { value }),
        max: t("orderEntry.tpTriggerPrice.error.max", { value }),
        priceErrorMin:
          "Your TP trigger price should be set lower than your order price.",
        priceErrorMax:
          "Your TP trigger price should be set higher than your order price.",
      },
      sl_trigger_price: {
        required: "SL trigger price is required",
        min: t("orderEntry.slTriggerPrice.error.min", { value }),
        max: t("orderEntry.slTriggerPrice.error.max", { value }),
        priceErrorMin:
          "Your SL trigger price should be set lower than your order price.",
        priceErrorMax:
          "Your SL trigger price should be set higher than your order price.",
      },
      tp_order_price: {
        required: "TP order price is required",
        min: t("orderEntry.tpTriggerPrice.error.min", { value }),
        max: t("orderEntry.tpTriggerPrice.error.max", { value }),
      },
      sl_order_price: {
        required: "SL order price is required",
        min: t("orderEntry.slTriggerPrice.error.min", { value }),
        max: t("orderEntry.slTriggerPrice.error.max", { value }),
      },
      total: {
        min: t("orderEntry.total.error.min", { value }),
      },
    };

    return map[key]?.[type as keyof (typeof map)[Keys]];
  };

  const parseErrorMsg = (key: Keys) => {
    const { type, value } = errors?.[key] || ({} as OrderValidationItem);
    if (type) {
      return getMessage(key, value, type);
    }
    return "";
  };

  return {
    parseErrorMsg,
  };
}
