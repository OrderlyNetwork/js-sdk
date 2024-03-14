import { AlgoOrderType } from "@orderly.network/types";

export function offsetToPrice(
  markPrice: number,
  offset: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? markPrice + offset
    : markPrice - offset;
}

export function priceToOffset(
  markPrice: number,
  targetPrice: number,
  side: AlgoOrderType
) {
  return side === AlgoOrderType.TAKE_PROFIT
    ? targetPrice - markPrice
    : markPrice - targetPrice;
}

export function offsetPercentageToPrice(
  markPrice: number,
  offset: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? markPrice + markPrice * (offset / 100)
    : markPrice - markPrice * (offset / 100);
}

export function priceToOffsetPercentage(
  markPrice: number,
  targetPrice: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? (targetPrice - markPrice) / markPrice
    : (markPrice - targetPrice) / markPrice;
}

export function pnlToPrice(price: number, pnl: number, type: AlgoOrderType) {
  return type === AlgoOrderType.TAKE_PROFIT ? price + pnl : price - pnl;
}

export function priceToPnl(
  markPrice: number,
  targetPrice: number,
  type: AlgoOrderType
) {
  return type === AlgoOrderType.TAKE_PROFIT
    ? targetPrice - markPrice
    : markPrice - targetPrice;
}

export function calculateHelper(inputs: {
  key: string;
  value: number;
  markPrice: number;
}) {
  switch (inputs.key) {
    case "tp_trigger_price":
      return {
        tp_trigger_price: inputs.value,
        tp_offset: priceToOffset(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.TAKE_PROFIT
        ),
        tp_offset_percentage: priceToOffsetPercentage(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.TAKE_PROFIT
        ),
        tp_pnl: priceToPnl(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.TAKE_PROFIT
        ),
      };
    case "tp_offset":
      return {
        tp_trigger_price: offsetToPrice(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.TAKE_PROFIT
        ),
        tp_offset: inputs.value,
        tp_offset_percentage: priceToOffsetPercentage(
          inputs.markPrice,
          offsetToPrice(
            inputs.markPrice,
            inputs.value,
            AlgoOrderType.TAKE_PROFIT
          ),
          AlgoOrderType.TAKE_PROFIT
        ),
      };
    case "tp_offset_percentage":
      return {
        tp_trigger_price: offsetPercentageToPrice(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.TAKE_PROFIT
        ),
        tp_offset: priceToOffset(
          inputs.markPrice,
          offsetPercentageToPrice(
            inputs.markPrice,
            inputs.value,
            AlgoOrderType.TAKE_PROFIT
          ),
          AlgoOrderType.TAKE_PROFIT
        ),
        tp_offset_percentage: inputs.value,
      };
    case "sl_trigger_price":
      return {
        sl_trigger_price: inputs.value,
        sl_offset: priceToOffset(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.STOP_LOSS
        ),
        sl_offset_percentage: priceToOffsetPercentage(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.STOP_LOSS
        ),
      };
    case "sl_offset":
      return {
        sl_trigger_price: offsetToPrice(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.STOP_LOSS
        ),
        sl_offset: inputs.value,
        sl_offset_percentage: priceToOffsetPercentage(
          inputs.markPrice,
          offsetToPrice(
            inputs.markPrice,
            inputs.value,
            AlgoOrderType.STOP_LOSS
          ),
          AlgoOrderType.STOP_LOSS
        ),
      };
    case "sl_offset_percentage":
      return {
        sl_trigger_price: offsetPercentageToPrice(
          inputs.markPrice,
          inputs.value,
          AlgoOrderType.STOP_LOSS
        ),
        sl_offset: priceToOffset(
          inputs.markPrice,
          offsetPercentageToPrice(
            inputs.markPrice,
            inputs.value,
            AlgoOrderType.STOP_LOSS
          ),
          AlgoOrderType.STOP_LOSS
        ),
        sl_offset_percentage: inputs.value,
      };
    default:
      return {};
  }
}
