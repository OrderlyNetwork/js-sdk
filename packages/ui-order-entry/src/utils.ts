import {
  BBOOrderType,
  OrderLevel,
  OrderSide,
  OrderType,
} from "@orderly.network/types";

export enum BBOStatus {
  ON = "on",
  OFF = "off",
  DISABLED = "disabled",
}

export const BBOType2Label: Record<BBOOrderType, string> = {
  [BBOOrderType.COUNTERPARTY1]: "Counterparty 1",
  [BBOOrderType.COUNTERPARTY5]: "Counterparty 5",
  [BBOOrderType.QUEUE1]: "Queue 1",
  [BBOOrderType.QUEUE5]: "Queue 5",
};

/**
 * if provide order_type, check order_type and order_type_ext, otherswise only check order_type_ext
 */
export function isBBOOrder(options: {
  order_type?: OrderType;
  order_type_ext?: OrderType;
}) {
  const { order_type, order_type_ext } = options;

  const isBBO = [OrderType.ASK, OrderType.BID].includes(order_type_ext!);

  if (order_type) {
    return order_type === OrderType.LIMIT && isBBO;
  }

  return isBBO;
}

export function getOrderTypeByBBO(value: BBOOrderType, size: OrderSide) {
  if (
    [BBOOrderType.COUNTERPARTY1, BBOOrderType.COUNTERPARTY5].includes(value)
  ) {
    return size === OrderSide.BUY ? OrderType.ASK : OrderType.BID;
  }

  if ([BBOOrderType.QUEUE1, BBOOrderType.QUEUE5].includes(value)) {
    return size === OrderSide.BUY ? OrderType.BID : OrderType.ASK;
  }
}

export function getOrderLevelByBBO(value: BBOOrderType) {
  if ([BBOOrderType.COUNTERPARTY1, BBOOrderType.QUEUE1].includes(value)) {
    return OrderLevel.ONE;
  }

  if ([BBOOrderType.COUNTERPARTY5, BBOOrderType.QUEUE5].includes(value)) {
    return OrderLevel.FIVE;
  }
}

export function getBBOType(options: {
  type: OrderType;
  side: OrderSide;
  level: OrderLevel;
}) {
  const { type, side, level } = options;
  if (type === OrderType.ASK) {
    if (level === OrderLevel.ONE) {
      return side === OrderSide.BUY
        ? BBOOrderType.COUNTERPARTY1
        : BBOOrderType.QUEUE1;
    }

    if (level === OrderLevel.FIVE) {
      return side === OrderSide.BUY
        ? BBOOrderType.COUNTERPARTY5
        : BBOOrderType.QUEUE5;
    }
  }

  if (type === OrderType.BID) {
    if (level === OrderLevel.ONE) {
      return side === OrderSide.BUY
        ? BBOOrderType.QUEUE1
        : BBOOrderType.COUNTERPARTY1;
    }

    if (level === OrderLevel.FIVE) {
      return side === OrderSide.BUY
        ? BBOOrderType.QUEUE5
        : BBOOrderType.COUNTERPARTY5;
    }
  }
}
