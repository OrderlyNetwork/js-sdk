import { API, OrderSide } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { IMRFactorPower } from "./constants";

export type ResultOptions = {
  dp: number;
};

export type TotalValueInputs = {
  totalUnsettlementPnL: number;

  USDCHolding: number;
  nonUSDCHolding: {
    holding: number;
    markPrice: number;
    //Margin replacement rate, currently default to 0
    discount: number;
  }[];
};
/**
 * User's total asset value (denominated in USDC), including assets that cannot be used as collateral.
 */
export function totalValue(inputs: TotalValueInputs): Decimal {
  const { totalUnsettlementPnL, USDCHolding, nonUSDCHolding } = inputs;

  const nonUSDCHoldingValue = nonUSDCHolding.reduce((acc, cur) => {
    return new Decimal(cur.holding).mul(cur.markPrice).add(acc);
  }, zero);

  return nonUSDCHoldingValue.add(USDCHolding).add(totalUnsettlementPnL);
}

/**
 * Total value of available collateral in the user's account (denominated in USDC).
 */
export type FreeCollateralInputs = {
  // Total collateral
  totalCollateral: Decimal;
  // Total initial margin with orders
  totalInitialMarginWithOrders: number;
};
/**
 * Calculate free collateral.
 */
export function freeCollateral(inputs: FreeCollateralInputs): Decimal {
  const value = inputs.totalCollateral.sub(inputs.totalInitialMarginWithOrders);
  // free collateral cannot be less than 0
  return value.isNegative() ? zero : value;
}

export type TotalCollateralValueInputs = {
  // Quantity of USDC holdings
  USDCHolding: number;
  nonUSDCHolding: {
    holding: number;
    markPrice: number;
    // Margin replacement rate, currently default to 0
    discount: number;
  }[];
  // Unsettled profit and loss
  unsettlementPnL: number;
};
/**
 * Calculate total collateral.
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
 * Sum of notional value for a symbol's position and orders.
 */
export function positionNotionalWithOrder_by_symbol(
  inputs: PositionNotionalWithOrderInputs,
): Decimal {
  return new Decimal(inputs.markPrice).mul(inputs.positionQtyWithOrders);
}

export type PositionQtyWithOrderInputs = {
  positionQty: number;
  // Total quantity of buy orders for a symbol
  buyOrdersQty: number;
  // Total quantity of sell orders for a symbol
  sellOrdersQty: number;
};
/**
 *  Sum of position quantity and orders quantity for a symbol.
 */
export function positionQtyWithOrders_by_symbol(
  inputs: PositionQtyWithOrderInputs,
): number {
  const { positionQty, buyOrdersQty, sellOrdersQty } = inputs;
  const positionQtyDecimal = new Decimal(positionQty);
  const qty = Math.max(
    positionQtyDecimal.add(buyOrdersQty).abs().toNumber(),
    positionQtyDecimal.sub(sellOrdersQty).abs().toNumber(),
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
 * Initial margin rate for a symbol.
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
          .toPower(IMR_factor_power),
      )
      .toNumber(),
  );
}

export function buyOrdersFilter_by_symbol(
  orders: API.Order[],
  symbol: string,
): API.Order[] {
  return orders.filter(
    (item) => item.symbol === symbol && item.side === OrderSide.BUY,
  );
}

export function sellOrdersFilter_by_symbol(
  orders: API.Order[],
  symbol: string,
): API.Order[] {
  return orders.filter(
    (item) => item.symbol === symbol && item.side === OrderSide.SELL,
  );
}

/**
 * Get the quantity of a specified symbol from the list of positions.
 */
export function getQtyFromPositions(
  positions: API.Position[],
  symbol: string,
): number {
  if (!positions) {
    return 0;
  }
  const position = positions.find((item) => item.symbol === symbol);
  return position?.position_qty || 0;
}

/**
 * Get the quantity of long and short orders for a specified symbol from the list of orders.
 */
export function getQtyFromOrdersBySide(
  orders: API.Order[],
  symbol: string,
  side: OrderSide,
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
 * Calculate the total initial margin used by the user (including positions and orders).
 */
export function totalInitialMarginWithOrders(
  inputs: TotalInitialMarginWithOrdersInputs,
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
      OrderSide.SELL,
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

export function totalInitialMarginWithQty(inputs: {
  positions: API.Position[];
  // account: API.AccountInfo;
  markPrices: { [key: string]: number };
  symbolInfo: any;
  IMR_Factors: { [key: string]: number };
  maxLeverage: number;
}) {
  const { positions, markPrices, IMR_Factors, symbolInfo, maxLeverage } =
    inputs;
  const symbols = positions.map((item) => item.symbol);

  const total_initial_margin_with_orders = symbols.reduce((acc, cur) => {
    const symbol = cur;
    const position = positions.find((item) => item.symbol === symbol);
    const positionQty = position?.position_qty || 0;

    const buyOrdersQty = position?.pending_long_qty || 0;
    const sellOrdersQty = position?.pending_short_qty || 0;

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
 * Group orders by symbol, as a symbol can have multiple orders.
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
  orders: Pick<API.Order, "symbol">[],
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
  // the position list for other symbols except the current symbol
  positions: API.Position[];

  markPrices: { [key: string]: number };
  maxLeverage: number;
  symbolInfo: any;
  IMR_Factors: { [key: string]: number };
};
/**
 * Total margin used by other symbols (except the current symbol).
 */
export function otherIMs(inputs: OtherIMsInputs): number {
  const {
    // orders,
    positions,
    maxLeverage,
    IMR_Factors,
    symbolInfo,
    markPrices,
  } = inputs;

  const symbols = positions.map((item) => item.symbol);

  return symbols
    .reduce((acc, cur) => {
      const symbol = cur;

      if (typeof markPrices[symbol] === "undefined") {
        console.warn("markPrices[%s] is undefined", symbol);
        return acc;
      }

      const markPriceDecimal = new Decimal(markPrices[symbol] || 0);

      const position = positions.find((item) => item.symbol === symbol);

      const positionQty = getQtyFromPositions(positions, symbol);
      const positionNotional = markPriceDecimal.mul(positionQty).toNumber();

      const buyOrdersQty = position!.pending_long_qty;
      const sellOrdersQty = position!.pending_short_qty;

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

  // Maximum quantity limit for opening a single position, /v1/public/info.base_max
  baseMaxQty: number;
  /**
   * Total collateral of the user (denominated in USDC), can be calculated from totalCollateral.
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
  // Quantity of open positions
  positionQty: number;
  // Quantity of long orders
  buyOrdersQty: number;
  // Quantity of short orders
  sellOrdersQty: number;

  IMR_Factor: number;

  takerFeeRate: number;
};

/**
 * Maximum order quantity.
 */
export function maxQty(
  side: OrderSide,
  inputs: MaxQtyInputs,
  options?: ResultOptions,
): number {
  if (side === OrderSide.BUY) {
    return maxQtyByLong(inputs);
  }
  return maxQtyByShort(inputs);
}

export function maxQtyByLong(
  inputs: Omit<MaxQtyInputs, "side">,
  options?: ResultOptions,
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
          .add(Math.max(1 / maxLeverage, baseIMR)),
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
        new Decimal(positionQty).add(buyOrdersQty),
        // .abs()
        // .div(new Decimal(takerFeeRate).mul(2).mul(0.0001).add(1))
      )
      .div(new Decimal(takerFeeRate).mul(2).mul(0.0001).add(1))
      .mul(0.995)
      .toNumber();

    return Math.min(baseMaxQty, factor_1, factor_2);
  } catch (error) {
    return 0;
  }
}

export function maxQtyByShort(
  inputs: Omit<MaxQtyInputs, "side">,
  options?: ResultOptions,
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
          .add(Math.max(1 / maxLeverage, baseIMR)),
      )
      .div(markPrice)
      .mul(0.995)
      // .add(new Decimal(positionQty).add(sellOrdersQty))
      .add(positionQty)
      .sub(sellOrdersQty)

      .toNumber();

    if (positionQty === 0 && buyOrdersQty === 0) {
      return Math.min(baseMaxQty, factor_1);
    }

    const factor_2 = totalCollateralDecimal
      .sub(otherIMs)
      .div(IMR_Factor)
      .toPower(1 / 1.8)
      .div(markPrice)
      // .add(
      // new Decimal(positionQty)
      //   .add(sellOrdersQty)
      //   // .abs()
      //   )
      .add(positionQty)
      .sub(sellOrdersQty)
      .div(new Decimal(takerFeeRate).mul(2).mul(0.0001).add(1))
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
 * total margin ratio
 */
export function totalMarginRatio(
  inputs: TotalMarginRatioInputs,
  dp?: number,
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
 */
export function totalUnrealizedROI(inputs: TotalUnrealizedROIInputs) {
  const { totalUnrealizedPnL, totalValue } = inputs;

  return new Decimal(totalUnrealizedPnL)
    .div(totalValue - totalUnrealizedPnL)
    .toNumber();
}

/**
 * current account leverage
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
  if (inputs.positionsMMR === 0) {
    return null;
  }
  return new Decimal(inputs.positionsMMR)
    .div(inputs.positionsNotional)
    .toNumber();
}

export const collateralRatio = (params: {
  baseWeight: number;
  discountFactor: number | null;
  collateralQty: number;
  indexPrice: number;
}) => {
  const { baseWeight, discountFactor, collateralQty, indexPrice } = params;

  const K = new Decimal(1.2);
  const DCF = new Decimal(discountFactor || 0);
  const qty = new Decimal(collateralQty);
  const price = new Decimal(indexPrice);

  const notionalAbs = qty.mul(price).abs();
  const dynamicWeight = DCF.mul(notionalAbs).toPower(IMRFactorPower);
  const result = K.div(new Decimal(1).add(dynamicWeight));

  return Math.min(baseWeight, result.toNumber());
};

export const collateralContribution = (params: {
  collateralQty: number; // collateralQty 就是上面 fromValue 输入的值
  collateralRatio: number; // collateralRatio 是用另一个公式算出来的
  indexPrice: number; // indexPrice 是我们现在可以直接拿到的
}) => {
  // Collateral contribution = collateral_qty * collateral_ratio * index_price

  const { collateralQty, collateralRatio, indexPrice } = params;
  return new Decimal(collateralQty)
    .mul(collateralRatio)
    .mul(indexPrice)
    .toNumber();
};

export const LTV = (params: {
  usdcBalance: number;
  upnl: number;
  collateralAssets: Array<Record<"qty" | "indexPrice" | "weight", number>>;
}) => {
  // LTV = (abs(min(USDC_balance, 0)) + abs(min(upnl, 0)) ) /
  // [sum(max(collateral_qty_i, 0) × index_price_i × weight_i ) + max(upnl, 0)]

  const { usdcBalance, upnl, collateralAssets } = params;

  const usdcLoss = new Decimal(Math.min(usdcBalance, 0)).abs();
  const upnlLoss = new Decimal(Math.min(upnl, 0)).abs();
  const numerator = usdcLoss.add(upnlLoss);

  const collateralSum = collateralAssets.reduce<Decimal>((acc, asset) => {
    return acc.add(
      new Decimal(Math.max(asset.qty, 0))
        .mul(new Decimal(asset.indexPrice))
        .mul(new Decimal(asset.weight)),
    );
  }, zero);

  const denominator = collateralSum.add(new Decimal(Math.max(upnl, 0)));

  // 分母如果为 0，则直接返回 0
  if (denominator.isZero()) {
    return 0;
  }

  return numerator.div(denominator).toNumber();
};

export const maxWithdrawalUSDC = (inputs: {
  USDCBalance: number;
  freeCollateral: number;
  upnl: number;
}) => {
  const { USDCBalance, freeCollateral, upnl } = inputs;
  const value = Math.min(
    new Decimal(USDCBalance).toNumber(),
    new Decimal(freeCollateral).sub(Math.max(upnl, 0)).toNumber(),
  );
  return Math.max(0, value);
};

export const maxWithdrawalOtherCollateral = (inputs: {
  collateralQty: number;
  freeCollateral: number;
  indexPrice: number;
  weight: number;
}) => {
  const { collateralQty, freeCollateral, indexPrice, weight } = inputs;
  const denominator = new Decimal(indexPrice).mul(weight);

  // 分母如果为 0，则直接返回 0
  if (denominator.isZero()) {
    return 0;
  }
  const maxQtyByValue = new Decimal(freeCollateral).div(denominator).toNumber();
  return Math.min(collateralQty, maxQtyByValue);
};

export const calcMinimumReceived = (inputs: {
  amount: number;
  slippage: number;
}) => {
  const { amount, slippage } = inputs;
  const MAX_SLIPPAGE = 3;
  const safeSlippage = Math.min(slippage, MAX_SLIPPAGE);
  const slippageRatio = new Decimal(safeSlippage).div(100);
  return new Decimal(amount)
    .mul(new Decimal(1).minus(slippageRatio))
    .toNumber();
};
