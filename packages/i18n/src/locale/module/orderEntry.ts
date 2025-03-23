export const orderEntry = {
  "orderEntry.buyLong": "Buy / Long",
  "orderEntry.sellShort": "Sell / Short",
  "orderEntry.reduceOnly": "Reduce only",
  "orderEntry.bbo": "BBO",
  "orderEntry.available": "Available",
  "orderEntry.bbo.disabled.tips":
    "BBO is not supported when TP/SL, Post-Only, IOC, or FOK is selected.",

  "orderEntry.orderType.limit": "Limit",
  "orderEntry.orderType.market": "Market",
  "orderEntry.orderType.limitOrder": "Limit order",
  "orderEntry.orderType.marketOrder": "Market order",
  "orderEntry.orderType.stopLimit": "Stop limit",
  "orderEntry.orderType.stopMarket": "Stop market",
  "orderEntry.orderType.postOnly": "Post only",
  "orderEntry.orderType.ioc": "IOC",
  "orderEntry.orderType.fok": "FOK",

  "orderEntry.bbo.counterparty1": "Counterparty 1",
  "orderEntry.bbo.counterparty5": "Counterparty 5",
  "orderEntry.bbo.queue1": "Queue 1",
  "orderEntry.bbo.queue5": "Queue 5",

  "orderEntry.estLiqPrice": "Est. Liq. price",
  "orderEntry.accountLeverage": "Account leverage",

  "orderEntry.disableOrderConfirm": "Disable order confirmation",
  "orderEntry.orderConfirm": "Order confirm",
  "orderEntry.hidden": "Hidden",
  "orderEntry.keepVisible": "Keep visible",

  "orderEntry.maxBuy": "Max buy",
  "orderEntry.maxSell": "Max sell",

  "orderEntry.tpMarkPrice": "TP Price (Mark)",
  "orderEntry.slMarkPrice": "SL Price (Mark)",
  "orderEntry.tpsl.trigger.description":
    "TP/SL triggers at the specified mark price and executes as a market order.",
  "orderEntry.estRoi": "Est.ROI",
  "orderEntry.estPnL": "Est.PnL",

  "orderEntry.tpsl": "TP/SL",
  "orderEntry.tpsl.tips":
    "TP/SL triggers at the specified mark price and executes as a market order. By default, it applies to the entire position. Adjust settings in open positions for partial TP/SL.",

  "orderEntry.orderQuantity.error.required": "Quantity is required",
  "orderEntry.orderQuantity.error.min":
    "Quantity must be greater than {{value}}",
  "orderEntry.orderQuantity.error.max": "Quantity must be less than {{value}}",

  "orderEntry.orderPrice.error.required": "Price is required",
  "orderEntry.orderPrice.error.min": "Price must be greater than {{value}}",
  "orderEntry.orderPrice.error.max": "Price must be less than {{value}}",

  "orderEntry.triggerPrice.error.required": "Trigger price is required",
  "orderEntry.triggerPrice.error.min":
    "Trigger price must be greater than {{value}}",
  "orderEntry.triggerPrice.error.max":
    "Trigger price must be less than {{value}}",

  "orderEntry.tpTriggerPrice.error.min":
    "TP Price must be greater than {{value}}",
  "orderEntry.tpTriggerPrice.error.max": "TP Price must be less than {{value}}",

  "orderEntry.slTriggerPrice.error.min":
    "SL Price must be greater than {{value}}",
  "orderEntry.slTriggerPrice.error.max": "SL Price must be less than {{value}}",

  "orderEntry.total.error.min":
    "The order value should be greater or equal to {{value}} USDC",
};

export type OrderEntry = typeof orderEntry;
