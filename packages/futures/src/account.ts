import { Decimal } from "@orderly/utils";
import { IMRFactorPower } from "./constants";
import { API, OrderSide, OrderType, type WSMessage } from "@orderly/types";

/**
 * 用戶帳戶當前可用保證金的價值總和 (USDC計價)
 *
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Free-collateral}
 */
export type FreeCollateralInputs = {
  // 总保证金
  totalCollateral: Decimal;
  // 总初始保证金
  totalInitialMarginWithOrders: number;
};
/**
 * 计算可用保证金
 */
export function freeCollateral(inputs: FreeCollateralInputs): Decimal {
  return inputs.totalCollateral.sub(inputs.totalInitialMarginWithOrders);
}

export type TotalCollateralValueInputs = {
  // USDC 的 holding 數量
  USDCHolding: number;
  nonUSDCHolding: {
    holding: number;
    markPrice: number;
    //保證金替代率 暂时默认0
    discount: number;
  }[];
  // 未结算盈亏
  unsettlementPnL: number;
};
/**
 * 计算总保证金
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Total-collateral-%5BinlineExtension%5D}
 */
export function totalCollateral(inputs: TotalCollateralValueInputs): number {
  const nonUSDCHoldingValue = inputs.nonUSDCHolding.reduce((acc, cur) => {
    return (
      acc +
      new Decimal(cur.holding).mul(cur.markPrice).mul(cur.discount).toNumber()
    );
  }, 0);

  return new Decimal(inputs.USDCHolding)
    .add(nonUSDCHoldingValue)
    .add(inputs.unsettlementPnL)
    .toNumber();
}

export function initialMarginWithOrder() {}

export type PositionNotionalWithOrderInputs = {
  markPrice: number;
  positionQtyWithOrders: number;
};
/**
 * 單一 Symbol position / orders notional 加總
 */
export function positionNotionalWithOrder_by_symbol(
  inputs: PositionNotionalWithOrderInputs
): Decimal {
  return new Decimal(inputs.markPrice).mul(inputs.positionQtyWithOrders);
}

export type PositionQtyWithOrderInputs = {
  positionQty: number;
  // 单个Symbol的所有买单合计
  buyOrdersQty: number;
  // 单个Symbol的所有卖单合计
  sellOrdersQty: number;
};
/**
 *  單一 Symbol position / orders qty 加總
 */
export function positionQtyWithOrders_by_symbol(
  inputs: PositionQtyWithOrderInputs
): number {
  const { positionQty, buyOrdersQty, sellOrdersQty } = inputs;
  const positionQtyDecimal = new Decimal(positionQty);
  return Math.max(
    positionQtyDecimal.add(buyOrdersQty).abs().toNumber(),
    positionQtyDecimal.add(sellOrdersQty).abs().toNumber()
  );
}

export type IMRInputs = {
  maxLeverage: number;
  baseIMR: number;
  IMR_Factor: number;
  positionNotional: number;
  orderNotional: number;
  IMR_factor_power?: number;
};

/**
 * 單一 Symbol 初始保證金率
 * Max(1 / Max Account Leverage, Base IMR i, IMR Factor i * Abs(Position Notional i + Order Notional i)^(4/5))
 */
export function IMR(inputs: IMRInputs): number {
  // console.log("inputs", inputs);
  const {
    maxLeverage,
    baseIMR,
    IMR_Factor,
    positionNotional,
    orderNotional,
    IMR_factor_power = IMRFactorPower,
  } = inputs;
  return Math.max(
    1 / maxLeverage,
    baseIMR,
    new Decimal(IMR_Factor)
      .mul(
        new Decimal(positionNotional)
          .add(orderNotional)
          .abs()
          .toPower(IMR_factor_power)
      )
      .toNumber()
  );
}

export function buyOrdersFilter_by_symbol(
  orders: API.Order[],
  symbol: string
): API.Order[] {
  return orders.filter(
    (item) => item.symbol === symbol && item.side === OrderSide.BUY
  );
}

export function sellOrdersFilter_by_symbol(
  orders: API.Order[],
  symbol: string
): API.Order[] {
  return orders.filter(
    (item) => item.symbol === symbol && item.side === OrderSide.SELL
  );
}

function getQtyFromPositions(
  positions: API.Position[],
  symbol: string
): number {
  const position = positions.find((item) => item.symbol === symbol);
  return position?.position_qty || 0;
}

function getQtyFromOrdersBySide(
  orders: API.Order[],
  symbol: string,
  side: OrderSide
): number {
  const ordersBySide =
    side === OrderSide.SELL
      ? sellOrdersFilter_by_symbol(orders, symbol)
      : buyOrdersFilter_by_symbol(orders, symbol);
  return ordersBySide.reduce((acc, cur) => {
    return acc + cur.quantity;
  }, 0);
}

export type TotalInitialMarginWithOrdersInputs = {
  positions: API.Position[];
  orders: API.Order[];
  // account: API.AccountInfo;
  markPrices: { [key: string]: number };
  symbolInfo: any;
  IMR_Factors: { [key: string]: number };
} & Pick<IMRInputs, "maxLeverage">;

/**
 * 计算用戶已使用初始保證金加總 ( 包含 position / orders )
 */
export function totalInitialMarginWithOrders(
  inputs: TotalInitialMarginWithOrdersInputs
): number {
  const {
    positions,
    orders,
    markPrices,
    IMR_Factors,
    maxLeverage,
    symbolInfo,
  } = inputs;
  const symbols = extractSymbols(positions, orders);

  const total_initial_margin_with_orders = symbols.reduce((acc, cur) => {
    const symbol = cur;
    const positionQty = getQtyFromPositions(positions, symbol);
    const buyOrdersQty = getQtyFromOrdersBySide(orders, symbol, OrderSide.BUY);
    const sellOrdersQty = getQtyFromOrdersBySide(
      orders,
      symbol,
      OrderSide.SELL
    );

    const markPrice = markPrices[symbol] || 0;

    //---
    const positionQtyWithOrders = positionQtyWithOrders_by_symbol({
      positionQty,
      buyOrdersQty,
      sellOrdersQty,
    });

    //---
    const position_notional_with_orders = positionNotionalWithOrder_by_symbol({
      markPrice,
      positionQtyWithOrders,
    });

    //----
    const markPriceDecimal = new Decimal(markPrice);

    const imr = IMR({
      positionNotional: markPriceDecimal.mul(positionQty).toNumber(),
      orderNotional: markPriceDecimal
        .mul(new Decimal(buyOrdersQty).add(sellOrdersQty))
        .toNumber(),
      maxLeverage,
      IMR_Factor: IMR_Factors[symbolInfo[symbol]("base")],
      baseIMR: symbolInfo[symbol]("base_imr", 0),
    });

    return position_notional_with_orders.mul(imr).add(acc).toNumber();
  }, 0);

  return total_initial_margin_with_orders;
}

/**
 * 把订单按照symbol分组, 因为一个symbol可以有多个挂单
 */
export function groupOrdersBySymbol(orders: API.Order[]) {
  const symbols: { [key: string]: API.Order[] } = {};

  orders.forEach((item) => {
    if (!symbols[item.symbol]) {
      symbols[item.symbol] = [];
    }

    symbols[item.symbol].push(item);
  });

  return symbols;
}

/**
 * 从仓位和订单中提取所有的symbol
 * @returns
 */
function extractSymbols(
  positions: API.Position[],
  orders: API.Order[]
): string[] {
  const symbols = new Set<string>();

  positions.forEach((item) => {
    symbols.add(item.symbol);
  });

  orders.forEach((item) => {
    symbols.add(item.symbol);
  });

  return Array.from(symbols);
}

//=========== max qty ==================

export type MaxQtyInputs = {
  side: OrderSide;
  //單次開倉最大 Qty 限制,  /v1/public/info.base_max
  baseMaxQty: number;
  /**
   * 用户保证金总额（USDC 计价）, 可以由 totalCollateral 计算得出
   * @see totalCollateral
   */
  totalCollateral: number;
  maxLeverage: number;
  baseIMR: number;
  markPrice: number;
  // 已开仓数量
  positionQty: number;
  // 已挂多单数量
  buyOrdersQty: number;
  // 已挂空单数量
  sellOrdersQty: number;
};

/**
 * 最大可下单数量
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Max-Order-QTY}
 */
export function maxQty(inputs: MaxQtyInputs): number {
  if (inputs.side === OrderSide.BUY) {
    return maxQtyByLong(inputs);
  }
  return maxQtyByShort(inputs);
}

export function maxQtyByLong(inputs: Omit<MaxQtyInputs, "side">): number {
  return 0;
}

export function maxQtyByShort(inputs: Omit<MaxQtyInputs, "side">): number {
  return 0;
}
