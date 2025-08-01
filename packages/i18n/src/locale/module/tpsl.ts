export const tpsl = {
  "tpsl.tp": "TP",
  "tpsl.sl": "SL",
  "tpsl.tpPrice": "TP Price",
  "tpsl.slPrice": "SL Price",
  "tpsl.tpPnl": "TP PnL",
  "tpsl.slPnl": "SL PnL",
  "tpsl.tpTrigger": "TP trigger",
  "tpsl.slTrigger": "SL trigger",
  "tpsl.pnl": "PnL",
  "tpsl.offset": "Offset",
  "tpsl.add": "Add",
  "tpsl.cancelAll": "Cancel all",

  "tpsl.tpOrderPrice": "TP order price",
  "tpsl.slOrderPrice": "SL order price",
  "tpsl.tpTriggerPrice": "TP trigger price",
  "tpsl.slTriggerPrice": "SL trigger price",

  "tpsl.positionTpsl": "Position TP/SL",
  "tpsl.entirePosition": "Entire position",
  "tpsl.estPnl": "Est. PNL",
  "tpsl.takeProfit": "Take profit",
  "tpsl.stopLoss": "Stop loss",

  "tpsl.cancelOrder.description":
    "Are you sure you want to cancel this TP/SL order?",
  "tpsl.confirmOrder": "Confirm Order",
  "tpsl.advanced": "Advanced",
  "tpsl.positionType.full": "TP/SL: Full position",
  "tpsl.positionType.partial": "TP/SL: Partial position",
  "tpsl.positionType.full.tips":
    "TPSL (full) applies to the full position. Newly activated TPSL (full) orders will overwrite previous orders. Full position will be market closed when the price is triggered.",
  "tpsl.positionType.partial.tips":
    "TP/SL triggers at the specified mark price and executes as a market order. By default, it applies to the entire position. Adjust settings in open positions for partial TP/SL.",
  "tpsl.advanced.title": "TP/SL",
  "tpsl.advanced.quantity": "Quantity",
  "tpsl.advanced.lastPrice": "Last price",
  "tpsl.advanced.orderPrice": "Order price",
  "tpsl.advanced.triggerPrice": "Trigger price",
  "tpsl.advanced.pnl": "PnL",
  "tpsl.advanced.offset": "Offset",
  "tpsl.advanced.offsetPercentage": "Offset%",
  "tpsl.positionType.full.tips.market":
    "Full positions TP/SL only support market price to place the orders",
  "tpsl.advanced.TP.label": "Take profit",
  "tpsl.advanced.SL.label": "Stop loss",
  "tpsl.advanced.limit": "Limit",
  "tpsl.advanced.market": "Market",
  "tpsl.advanced.ROI":
    "When the mark price reaches <0/>, it will trigger a <1/> order, and estimated PnL will be <2/> and ROI is <3/>.",
  "tpsl.advanced.submit": "Submit",
  "tpsl.totalEstTpPnl": "Total est. TP PnL",
  "tpsl.totalEstSlPnl": "Total est. SL PnL",
  "tpsl.riskRewardRatio": "Risk reward ratio",

  "tpsl.validate.tpOrderPrice.error.required": "TP order price is required",
  "tpsl.validate.tpOrderPrice.error.min":
    "TP order price must be greater than {{value}}",
  "tpsl.validate.tpOrderPrice.error.max":
    "TP order price must be less than {{value}}",
  "tpsl.validate.slOrderPrice.error.required": "SL order price is required",
  "tpsl.validate.slOrderPrice.error.min":
    "SL order price must be greater than {{value}}",
  "tpsl.validate.slOrderPrice.error.max":
    "SL order price must be less than {{value}}",
  "tpsl.validate.tpTriggerPrice.error.priceErrorMin":
    "Your TP trigger price should be set lower than your order price.",
  "tpsl.validate.tpTriggerPrice.error.priceErrorMax":
    "Your TP trigger price should be set higher than your order price.",
  "tpsl.validate.slTriggerPrice.error.priceErrorMin":
    "Your SL trigger price should be set lower than your order price.",
  "tpsl.validate.slTriggerPrice.error.priceErrorMax":
    "Your SL trigger price should be set higher than your order price.",
  "tpsl.validate.tpTriggerPrice.error.required": "TP trigger price is required",
  "tpsl.validate.slTriggerPrice.error.required": "SL trigger price is required",

  "tpsl.tpslDetail.qty": "Qty.",
  "tpsl.tpslDetail.type": "Type",
  "tpsl.tpslDetail.trigger": "Trigger",
  "tpsl.tpslDetail.price": "Price",
  "tpsl.tpslDetail.estPnl": "Est. PnL",
  "tpsl.tpslDetail.estPnl.tooltip":
    "The actual value may differ based on the actual trading price. This value is only for reference.",
  "tpsl.agreement": "You agree to edit your {{symbol}} order.",
};

export type TPSL = typeof tpsl;
