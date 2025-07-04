export const orderEntry = {
  "orderEntry.buyLong": "Buy / Long",
  "orderEntry.sellShort": "Sell / Short",
  "orderEntry.reduceOnly": "Reduce only",

  "orderEntry.orderType.limit": "Limit",
  "orderEntry.orderType.market": "Market",
  // TODO：use orderEntry.orderType.limit
  "orderEntry.orderType.limitOrder": "Limit",
  // TODO：use orderEntry.orderType.market
  "orderEntry.orderType.marketOrder": "Market",
  "orderEntry.orderType.stopLimit": "Stop limit",
  "orderEntry.orderType.stopMarket": "Stop market",
  "orderEntry.orderType.postOnly": "Post only",
  "orderEntry.orderType.ioc": "IOC",
  "orderEntry.orderType.fok": "FOK",
  "orderEntry.orderType.scaledOrder": "Scaled",

  "orderEntry.upperPrice": "Upper price",
  "orderEntry.lowerPrice": "Lower price",
  "orderEntry.skew": "Skew",
  "orderEntry.totalOrders": "Total orders",
  "orderEntry.totalQuantity": "Total quantity",

  "orderEntry.quantityDistribution": "Qty distribution",

  "orderEntry.quantityDistribution.description":
    "Controls how order size is distributed across price levels. ",
  "orderEntry.quantityDistribution.formula":
    "Size Skew = (Size at highest price) ÷ (Size at lowest price)",

  "orderEntry.distributionType.flat": "Flat",
  "orderEntry.distributionType.ascending": "Ascending",
  "orderEntry.distributionType.ascending.abbr": "Asc.",
  "orderEntry.distributionType.descending": "Descending",
  "orderEntry.distributionType.descending.abbr": "Desc.",
  "orderEntry.distributionType.custom": "Custom",

  "orderEntry.distributionType.flat.description":
    "Uniform order allocation across the range.",
  "orderEntry.distributionType.ascending.description":
    "Greater size allocated to higher price levels.",
  "orderEntry.distributionType.descending.description":
    "Greater size allocated to lower price levels.",

  "orderEntry.bbo": "BBO",
  "orderEntry.bbo.counterparty1": "Counterparty 1",
  "orderEntry.bbo.counterparty5": "Counterparty 5",
  "orderEntry.bbo.queue1": "Queue 1",
  "orderEntry.bbo.queue5": "Queue 5",
  "orderEntry.bbo.disabled.tips":
    "BBO is not supported when TP/SL, Post-Only, IOC, or FOK is selected.",

  "orderEntry.estLiqPrice": "Est. liq. price",

  "orderEntry.disableOrderConfirm": "Disable order confirmation",
  "orderEntry.orderConfirm": "Order confirm",
  "orderEntry.confirmScaledOrder": "Confirm scaled order",
  "orderEntry.hidden": "Hidden",
  "orderEntry.keepVisible": "Keep visible",

  "orderEntry.maxBuy": "Max buy",
  "orderEntry.maxSell": "Max sell",

  "orderEntry.tpMarkPrice": "TP price (Mark)",
  "orderEntry.slMarkPrice": "SL price (Mark)",
  "orderEntry.tpsl.trigger.description":
    "TP/SL triggers at the specified mark price and executes as a market order.",
  "orderEntry.estRoi": "Est.ROI",
  "orderEntry.estPnL": "Est.PnL",

  "orderEntry.tpsl.tips":
    "TP/SL triggers at the specified mark price and executes as a market order. By default, it applies to the entire position. Adjust settings in open positions for partial TP/SL.",

  // form errors
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

  "orderEntry.upperPrice.error.required": "Upper price is required",
  "orderEntry.upperPrice.error.min":
    "Upper price must be greater than {{value}}",
  "orderEntry.upperPrice.error.max": "Upper price must be less than {{value}}",

  "orderEntry.lowerPrice.error.required": "Lower price is required",
  "orderEntry.lowerPrice.error.min":
    "Lower price must be greater than {{value}}",
  "orderEntry.lowerPrice.error.max":
    "Lower price must be less than upper price",

  "orderEntry.totalOrders.error.required": "Total orders is required",
  "orderEntry.totalOrders.error.range":
    "Total orders must be in the range of 2 to 20.",

  "orderEntry.skew.error.required": "Skew is required",
  "orderEntry.skew.error.min": "Skew must be greater than {{value}}",
  "orderEntry.skew.error.max": "Skew must be less than {{value}}",

  "orderEntry.slippage": "Slippage",
  "orderEntry.slippage.est": "Est",
  "orderEntry.slippage.tips":
    "Your transaction will revert if the price changs unfavorably by more than this percentage.",
  "orderEntry.slippage.error.exceed":
    "The current input value cannot exceed 3%",
  "orderEntry.slippage.error.max":
    "Estimated slippage exceeds your maximum allowed slippage.",

  "orderEntry.confirmScaledOrder.orderPrice.warning":
    "This order will be filled immediately based on the current market price.",
  "orderEntry.scaledOrder.fullySuccessful":
    "Scaled order placed: {{total}} orders submitted successfully.",
  "orderEntry.scaledOrder.partiallySuccessful":
    "Scaled order partially submitted: {{successCount}} of {{total}} orders placed.",
  "orderEntry.scaledOrder.allFailed":
    "Scaled order failed. No orders were placed.",
};

export type OrderEntry = typeof orderEntry;
