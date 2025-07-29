import { OrderlyOrder } from "@orderly.network/types";
import { OrderValidationItem } from "./interface";

export class OrderValidation {
  static getLabel(key: keyof OrderlyOrder) {
    switch (key) {
      case "quantity":
      case "order_quantity":
        return "Quantity";
      case "order_price":
        return "Price";
      case "trigger_price":
        return "Trigger price";
      case "tp_trigger_price":
        return "TP price";
      case "sl_trigger_price":
        return "SL price";
      case "start_price":
        return "Start price";
      case "end_price":
        return "End price";
      case "total_orders":
        return "Total orders";
      case "skew":
        return "Skew";
      default:
        return key;
    }
  }

  static required(key: keyof OrderlyOrder) {
    return {
      type: "required",
      message: `${this.getLabel(key)} is required`,
    } as OrderValidationItem;
  }

  static min(key: keyof OrderlyOrder, value: number | string) {
    return {
      type: "min",
      message: `${this.getLabel(key)} must be greater than ${value}`,
      value,
    } as OrderValidationItem;
  }

  static max(key: keyof OrderlyOrder, value: number | string) {
    return {
      type: "max",
      message: `${this.getLabel(key)} must be less than ${value}`,
      value,
    } as OrderValidationItem;
  }

  static range(
    key: keyof OrderlyOrder,
    min?: number | string,
    max?: number | string,
  ) {
    return {
      type: "range",
      message: `${this.getLabel(key)} must be in the range of ${min} to ${max}`,
      min,
      max,
    } as OrderValidationItem;
  }
}
