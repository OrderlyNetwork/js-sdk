export const orders = {
  "orders.page.title": "Orders",

  "orders.page.tabs.all": "All",
  "orders.page.tabs.pending": "Pending",
  "orders.page.tabs.tpsl": "TP/SL",
  "orders.page.tabs.filled": "Filled",
  "orders.page.tabs.cancelled": "Cancelled",
  "orders.page.tabs.rejected": "Rejected",
  "orders.page.tabs.orderHistory": "Order history",

  "orders.side.all": "All sides",
  "orders.status.all": "All status",
  "orders.status.pending": "Pending",
  "orders.status.filled": "Filled",
  "orders.status.partialFilled": "Partial filled",
  "orders.status.canceled": "Canceled",
  "orders.status.rejected": "Rejected",

  "orders.status.new.title": "Order opened",
  "orders.status.filled.title": "Order filled",
  "orders.status.cancelled.title": "Order cancelled",
  "orders.status.rejected.title": "Order rejected",
  "orders.status.replaced.title": "Order edited",

  "orders.column.orderPrice": "Order price",
  "orders.column.orderPrice.quote": "Order price<0>(USDC)</0>",
  "orders.column.symbol": "Symbol",
  "orders.column.side": "Side",
  "orders.column.type": "Type",
  "orders.column.fill&Quantity": "Filled / Quantity",
  "orders.column.quantity": "Quantity",
  "orders.column.qty": "Qty.",
  "orders.column.price": "Price",
  "orders.column.avgPrice": "Avg. price",
  "orders.column.avgPrice.quote": "Avg. price<0>(USDC)</0>",
  "orders.column.avgOpen": "Avg. open",
  "orders.column.trigger": "Trigger",
  "orders.column.triggerPrice": "Trigger price",
  "orders.column.lastPrice": "Last price",
  "orders.column.tpsl": "TP/SL",
  "orders.column.notional": "Notional",
  "orders.column.notional.quote": "Notional<0>(USDC)</0>",
  "orders.column.realPnl": "Real. PnL",
  "orders.column.realPnl.quote": "Real. PnL<0>(USDC)</0>",
  "orders.column.orderTime": "Order time",
  "orders.column.fee": "Fee",
  "orders.column.status": "Status",
  "orders.column.reduceOnly": "Reduce only",
  "orders.column.hidden": "Hidden",
  "orders.column.hidden.no": "No",
  "orders.column.hidden.yes": "Yes",
  "orders.column.filled": "Filled",
  "orders.column.markPrice": "Mark price",
  "orders.column.limitPrice": "Limit price",
  "orders.column.tpTrigger": "TP trigger",
  "orders.column.slTrigger": "SL trigger",
  "orders.column.tpPrice": "TP price",
  "orders.column.slPrice": "SL price",

  "orders.editOrder": "Edit order",
  "positions.editOrder.max": "<0>Max</0> <1>{{quantity}}</1>",

  "order.edit.confirm.quantity":
    "You agree changing the quantity of {{base}}-PERP order to <0>{{value}}</0>.",
  "order.edit.confirm.price":
    "You agree changing the price of {{base}}-PERP order to <0>{{value}}</0>.",
  "order.edit.confirm.triggerPrice":
    "You agree changing the trigger price of {{base}}-PERP order to <0>{{value}}</0>.",

  "orders.cancelOrder": "Cancel order",
  "orders.cancelOrder.description":
    "Are you sure you want to cancel your pending order.",

  "orders.cancelAll": "Cancel all",
  "orders.pending.cancelAll": "Cancel all pending orders",
  "orders.pending.cancelAll.description":
    "Are you sure you want to cancel all of your pending orders?",
  "orders.tpsl.cancelAll": "Cancel all TP/SL orders",
  "orders.tpsl.cancelAll.description":
    "Are you sure you want to cancel all of your TP/SL orders?",

  "orders.tpsl.tpPnl.label": "TP PnL:",
  "orders.tpsl.slPnl.label": "SL PnL:",
  "orders.tpsl.tp.label": "TP:",
  "orders.tpsl.sl.label": "SL:",
  "orders.tpsl.tp.prefix": "TP -",
  "orders.tpsl.sl.prefix": "SL -",
  "orders.tpsl.tpMarket": "TP - Market",
  "orders.tpsl.slMarket": "SL - Market",
  "orders.price.market": "Market",
  "orders.price.greaterThan": "Price can not be greater than {{max}} USDC.",
  "orders.price.lessThan": "Price can not be less than {{min}} USDC.",

  "orders.quantity.lessThan": "Quantity should be less than {{quantity}}",
  "orders.quantity.lessThanPosition":
    "Quantity should be less than position quantity : {{quantity}}",

  "orders.history.renew": "Renew",

  "orders.disableOrderConfirm": "Disable order confirmation",

  "orders.download": "Download",
  "orders.download.tooltip":
    "The downloaded data will reflect only the applied filters (e.g., status, time, side, and pagination) and may not include all records.",
};

export type Orders = typeof orders;
