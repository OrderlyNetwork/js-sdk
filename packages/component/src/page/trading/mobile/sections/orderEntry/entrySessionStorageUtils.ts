import { parseJSON } from "@orderly.network/hooks";
import { OrderSide, OrderType } from "@orderly.network/types";


function readValue<T>(key: string, initialValue: T): T {
  // Prevent build error "window is undefined" but keep keep working
  if (typeof window === "undefined") {
    return initialValue;
  }

  try {
    const item = window.sessionStorage.getItem(key);
    return item ? (parseJSON(item) as T) : initialValue;
  } catch (error) {
    console.warn(`Error reading sessionStorage key “${key}”:`, error);
    return initialValue;
  }
}

export function getEntrySessionStorageInfo() {
  const orderType = readValue("order_type_key", OrderType.LIMIT);
  const reduceOnly = readValue("reduce_only_key", false);
  const orderSide = readValue("side_key", OrderSide.BUY);
  const orderTypeExt = readValue("order_type_ext_key", undefined);
  const sessionOrderEntry = readValue("order_entry_info", {
    "order_price": "",
    "order_quantity": "",
    "trigger_price": "",
  });

  return {
    orderType,
    reduceOnly,
    orderSide,
    orderTypeExt,
    sessionOrderEntry,
  };
}

export function setEntrySessionStorage(key: string, value: any) {
  const keys = [
    "order_type",
    "reduce_only",
    "side",
    "order_type_ext",
  ];

  if (keys.includes(key)) {
    sessionStorage.setItem(`${key}_key`, JSON.stringify(value));
  }

  const include = ["order_price", "order_quantity", "trigger_price"].includes(key);
  if (include) {
    const sessionOrderEntry: any = readValue("order_entry_info", {
      "order_price": "",
      "order_quantity": "",
      "trigger_price": "",
    });
    sessionOrderEntry[key] = value;
    sessionStorage.setItem("order_entry_info", JSON.stringify(sessionOrderEntry));
  }
}

export function clearOrderEntrySessionData() {

  setEntrySessionStorage("order_price", {
    "order_price": "",
    "order_quantity": "",
    "trigger_price": "",
  });
}