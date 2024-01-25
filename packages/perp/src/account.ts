import { Decimal, zero } from "@orderly.network/utils";
import { IMRFactorPower } from "./constants";
import {
  API,
  OrderSide,
  OrderType,
  type WSMessage,
} from "@orderly.network/types";

export type ResultOptions = {
  dp: number;
};

export type TotalValueInputs = {
  totalUnsettlementPnL: number;

  USDCHolding: number;
  nonUSDCHolding: {
    holding: number;
    markPrice: number;
    //保證金替代率 暂时默认0
    discount: number;
  }[];
};
/**
 * 用戶總資產價值 (USDC計價)，包含無法作為保證金的資產
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Total-Value}
 */
export function totalValue(inputs: TotalValueInputs): Decimal {
  const { totalUnsettlementPnL, USDCHolding, nonUSDCHolding } = inputs;

  const nonUSDCHoldingValue = nonUSDCHolding.reduce((acc, cur) => {
    return new Decimal(cur.holding).mul(cur.markPrice).add(acc);
  }, zero);

  return nonUSDCHoldingValue.add(USDCHolding).add(totalUnsettlementPnL);
}

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
  const value = inputs.totalCollateral.sub(inputs.totalInitialMarginWithOrders);
  // free collateral cannot be less than 0
  return value.isNegative() ? zero : value;
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
export function totalCollateral(inputs: TotalCollateralValueInputs): Decimal {
  const { USDCHolding, nonUSDCHolding } = inputs;
  const nonUSDCHoldingValue = nonUSDCHolding.reduce((acc, cur) => {
    return (
      acc +
      new Decimal(cur.holding).mul(cur.markPrice).mul(cur.discount).toNumber()
    );
  }, 0);

  return new Decimal(USDCHolding)
    .add(nonUSDCHoldingValue)
    .add(inputs.unsettlementPnL);
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
  const qty = Math.max(
    positionQtyDecimal.add(buyOrdersQty).abs().toNumber(),
    positionQtyDecimal.sub(sellOrdersQty).abs().toNumber()
  );

  return qty;
}

export type IMRInputs = {
  maxLeverage: number;
  baseIMR: number;
  IMR_Factor: number;
  positionNotional: number;
  ordersNotional: number;
  IMR_factor_power?: number;
};

/**
 * 單一 Symbol 初始保證金率
 * Max(1 / Max Account Leverage, Base IMR i, IMR Factor i * Abs(Position Notional i + Order Notional i)^(4/5))
 */
export function IMR(inputs: IMRInputs): number {
  const {
    maxLeverage,
    baseIMR,
    IMR_Factor,
    positionNotional,
    ordersNotional: orderNotional,
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

/**
 * 从仓位列表中获取指定symbol的仓位数量
 */
export function getQtyFromPositions(
  positions: API.Position[],
  symbol: string
): number {
  if (!positions) {
    return 0;
  }
  const position = positions.find((item) => item.symbol === symbol);
  return position?.position_qty || 0;
}

/**
 * 从订单列表中获取指定symbol的看多，看空订单数量，
 */
export function getQtyFromOrdersBySide(
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

export function getPositonsAndOrdersNotionalBySymbol(inputs: {
  positions: API.Position[];
  orders: API.Order[];
  symbol: string;
  markPrice: number;
}): number {
  const { positions, orders, symbol, markPrice } = inputs;
  const positionQty = getQtyFromPositions(positions, symbol);
  const buyOrdersQty = getQtyFromOrdersBySide(orders, symbol, OrderSide.BUY);
  const sellOrdersQty = getQtyFromOrdersBySide(orders, symbol, OrderSide.SELL);

  const markPriceDecimal = new Decimal(markPrice);

  return markPriceDecimal
    .mul(positionQty)
    .add(markPriceDecimal.mul(new Decimal(buyOrdersQty).add(sellOrdersQty)))
    .abs()
    .toNumber();
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
      ordersNotional: markPriceDecimal
        .mul(new Decimal(buyOrdersQty).add(sellOrdersQty))
        .toNumber(),
      maxLeverage,
      IMR_Factor: IMR_Factors[symbol],
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
 * Extracts all unique symbols from positions and orders.
 * @param positions - An array of position objects.
 * @param orders - An array of order objects.
 * @returns An array of unique symbols.
 */
export function extractSymbols(
  positions: Pick<API.Position, "symbol">[],
  orders: Pick<API.Order, "symbol">[]
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

// function otherIM(inputs: {}): number {}

export type OtherIMsInputs = {
  // 传入除当前symbol外的其他symbol的仓位列表
  positions: API.Position[];
  // 传入除当前symbol外的其他symbol的订单列表
  orders: API.Order[];

  markPrices: { [key: string]: number };
  maxLeverage: number;
  symbolInfo: any;
  IMR_Factors: { [key: string]: number };
};
/**
 * 除当前symbol外的其他symbol已占用的总保证金
 */
export function otherIMs(inputs: OtherIMsInputs): number {
  const {
    orders,
    positions,
    maxLeverage,
    IMR_Factors,
    symbolInfo,
    markPrices,
  } = inputs;

  const symbols = extractSymbols(positions, orders);

  return symbols
    .reduce((acc, cur) => {
      const symbol = cur;

      if (typeof markPrices[symbol] === "undefined") {
        console.warn("markPrices[%s] is undefined", symbol);
        return acc;
      }

      const markPriceDecimal = new Decimal(markPrices[symbol] || 0);

      const positionQty = getQtyFromPositions(positions, symbol);
      const positionNotional = markPriceDecimal.mul(positionQty).toNumber();

      const buyOrdersQty = getQtyFromOrdersBySide(
        orders,
        symbol,
        OrderSide.BUY
      );
      const sellOrdersQty = getQtyFromOrdersBySide(
        orders,
        symbol,
        OrderSide.SELL
      );

      const ordersNotional = markPriceDecimal
        .mul(new Decimal(buyOrdersQty).add(sellOrdersQty))
        .toNumber();

      const IMR_Factor = IMR_Factors[symbol];

      if (!IMR_Factor) {
        console.warn("IMR_Factor is not found:", symbol);
        return acc;
      }

      const imr = IMR({
        maxLeverage,

        IMR_Factor,
        baseIMR: symbolInfo[symbol]("base_imr", 0),
        positionNotional,
        ordersNotional,
      });

      const positionQtyWithOrders = positionQtyWithOrders_by_symbol({
        positionQty,
        buyOrdersQty,
        sellOrdersQty,
      });

      const positionNotionalWithOrders = positionNotionalWithOrder_by_symbol({
        markPrice: markPrices[symbol] || 0,
        positionQtyWithOrders,
      });

      return acc.add(positionNotionalWithOrders.mul(imr));
    }, zero)
    .toNumber();
}

export type MaxQtyInputs = {
  symbol: string;

  //單次開倉最大 Qty 限制,  /v1/public/info.base_max
  baseMaxQty: number;
  /**
   * 用户保证金总额（USDC 计价）, 可以由 totalCollateral 计算得出
   * @see totalCollateral
   */
  totalCollateral: number;
  maxLeverage: number;
  baseIMR: number;
  /**
   * @see otherIMs
   */
  otherIMs: number;
  markPrice: number;
  // 已开仓数量
  positionQty: number;
  // 已挂多单数量
  buyOrdersQty: number;
  // 已挂空单数量
  sellOrdersQty: number;

  IMR_Factor: number;

  takerFeeRate: number;
};

/**
 * 最大可下单数量
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Max-Order-QTY}
 */
export function maxQty(
  side: OrderSide,
  inputs: MaxQtyInputs,
  options?: ResultOptions
): number {
  if (side === OrderSide.BUY) {
    return maxQtyByLong(inputs);
  }
  return maxQtyByShort(inputs);
}

export function maxQtyByLong(
  inputs: Omit<MaxQtyInputs, "side">,
  options?: ResultOptions
): number {
  try {
    const {
      baseMaxQty,
      totalCollateral,
      otherIMs,
      maxLeverage,
      baseIMR,
      markPrice,
      IMR_Factor,
      positionQty,
      buyOrdersQty,
      takerFeeRate,
    } = inputs;

    if (totalCollateral === 0) {
      return 0;
    }

    const totalCollateralDecimal = new Decimal(totalCollateral);

    const factor_1 = totalCollateralDecimal
      .sub(otherIMs)
      .div(
        new Decimal(takerFeeRate)
          .mul(2)
          .mul(0.0001)
          .add(Math.max(1 / maxLeverage, baseIMR))
      )
      .div(markPrice)
      .mul(0.995)
      .sub(new Decimal(positionQty).add(buyOrdersQty))
      .toNumber();

    if (positionQty === 0 && buyOrdersQty === 0) {
      return Math.min(baseMaxQty, factor_1);
    }

    const factor_2 = totalCollateralDecimal
      .sub(otherIMs)
      .div(IMR_Factor)
      .toPower(1 / 1.8)
      .div(markPrice)
      .sub(
        new Decimal(positionQty)
          .add(buyOrdersQty)
          // .abs()
          .div(new Decimal(takerFeeRate).mul(2).mul(0.0001).add(1))
      )
      .mul(0.995)
      .toNumber();

    return Math.min(baseMaxQty, factor_1, factor_2);
  } catch (error) {
    return 0;
  }
}

export function maxQtyByShort(
  inputs: Omit<MaxQtyInputs, "side">,
  options?: ResultOptions
): number {
  try {
    const {
      baseMaxQty,
      totalCollateral,
      otherIMs,
      maxLeverage,
      baseIMR,
      markPrice,
      IMR_Factor,
      positionQty,
      buyOrdersQty,
      sellOrdersQty,
      takerFeeRate,
    } = inputs;

    const totalCollateralDecimal = new Decimal(totalCollateral);

    const factor_1 = totalCollateralDecimal
      .sub(otherIMs)
      .div(
        new Decimal(takerFeeRate)
          .mul(2)
          .mul(0.0001)
          .add(Math.max(1 / maxLeverage, baseIMR))
      )
      .div(markPrice)
      .mul(0.995)
      .add(new Decimal(positionQty).add(sellOrdersQty))

      .toNumber();

    if (positionQty === 0 && buyOrdersQty === 0) {
      return Math.min(baseMaxQty, factor_1);
    }

    const factor_2 = totalCollateralDecimal
      .sub(otherIMs)
      .div(IMR_Factor)
      .toPower(1 / 1.8)
      .div(markPrice)
      .add(
        new Decimal(positionQty)
          .add(sellOrdersQty)
          // .abs()
          .div(new Decimal(takerFeeRate).mul(2).mul(0.0001).add(1))
      )
      .mul(0.995)
      .toNumber();

    return Math.min(baseMaxQty, factor_1, factor_2);
  } catch (error) {
    return 0;
  }
}

export type TotalMarginRatioInputs = {
  totalCollateral: number;
  markPrices: { [key: string]: number };
  positions: API.Position[];
};
/**
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Total-Margin-Ratio}
 */
export function totalMarginRatio(
  inputs: TotalMarginRatioInputs,
  dp?: number
): number {
  const { totalCollateral, markPrices, positions } = inputs;

  if (totalCollateral === 0) {
    return 0;
  }

  const totalCollateralDecimal = new Decimal(totalCollateral);

  const totalPositionNotional = positions.reduce((acc, cur) => {
    const markPrice = markPrices[cur.symbol] || 0;
    return acc.add(new Decimal(cur.position_qty).mul(markPrice).abs());
  }, zero);

  if (totalPositionNotional.eq(zero)) {
    return 0;
  }

  return totalCollateralDecimal.div(totalPositionNotional).toNumber();
}

export type TotalUnrealizedROIInputs = {
  totalUnrealizedPnL: number;
  totalValue: number;
};

/**
 * totalUnrealizedROI
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Total-Unrealized-ROI}
 */
export function totalUnrealizedROI(inputs: TotalUnrealizedROIInputs) {
  const { totalUnrealizedPnL, totalValue } = inputs;

  return new Decimal(totalUnrealizedPnL)
    .div(totalValue - totalUnrealizedPnL)
    .toNumber();
}

/**
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Current-account-leverage}
 */
export function currentLeverage(totalMarginRatio: number) {
  if (totalMarginRatio === 0) {
    return 0;
  }
  return 1 / totalMarginRatio;
}

export type AvailableBalanceInputs = {
  USDCHolding: number;
  unsettlementPnL: number;
};
export function availableBalance(inputs: AvailableBalanceInputs) {
  const { USDCHolding, unsettlementPnL } = inputs;

  return new Decimal(USDCHolding).add(unsettlementPnL).toNumber();
}

export type AccountMMRInputs = {
  // Total Maintenance Margin of all positions of the user (USDC)
  positionsMMR: number;
  /**
   * Notional sum of all positions,
   * positions.totalNotional()
   */
  positionsNotional: number;
};

/**
 * total maintenance margin ratio
 * @param inputs AccountMMRInputs
 * @returns number|null
 */
export function MMR(inputs: AccountMMRInputs): number | null {
  // If the user does not have any positions, return null
  if (inputs.positionsNotional === 0) {
    return null;
  }
  return new Decimal(inputs.positionsMMR)
    .div(inputs.positionsNotional)
    .toNumber();
}
