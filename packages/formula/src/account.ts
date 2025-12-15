import { API, OrderSide } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import { IMRFactorPower } from "./constants";

export type ResultOptions = {
  dp: number;
};

/**
 * @formulaId totalValue
 * @name Total Value
 * @formula Total Value = total_holding + total unsettlement PNL, total_holding = usdc balance.holding + SUM(non-usdc balance.holding * mark price)
 * @description
 *
 * ## Definition
 *
 * **Total Value** = User's total asset value (denominated in USDC), including assets that cannot be used as collateral
 *
 * **Total holding** = Sum of all holding quantities in the user's account
 *
 * **usdc balance.holding** = USDC holding quantity
 *
 * **non-usdc balance.holding * mark price** = Value of non-USDC asset holdings (denominated in USDC)
 *
 * **holding**: Asset quantity held by the user, from `/v1/client/holding` or v2 Websocket API | Balance
 *
 * **mark price**: Current price of the asset, from v2 Websocket API | Balance
 *
 * **total unsettlement PNL** = Sum of user's account unsettled PNL
 *
 * ## Example
 *
 * ```
 * total_holding = 2000 + 1000 * 1.001 = 3001
 * Total Value = 3001 - 18.34 = 2982.66
 * total unsettlement PNL = -18.34
 * ```
 */
export function totalValue(inputs: {
  /**
   * @description Total unsettled PNL of user account
   */
  totalUnsettlementPnL: number;
  USDCHolding: number;
  nonUSDCHolding: {
    holding: number;
    indexPrice: number;
  }[];
}): Decimal {
  const { totalUnsettlementPnL, USDCHolding, nonUSDCHolding } = inputs;
  const nonUSDCHoldingValue = nonUSDCHolding.reduce((acc, cur) => {
    return new Decimal(cur.holding).mul(cur.indexPrice).add(acc);
  }, zero);
  return nonUSDCHoldingValue.add(USDCHolding).add(totalUnsettlementPnL);
}

/**
 * @formulaId freeCollateral
 * @name Free Collateral
 * @formula Free Collateral = Total_collateral_value - total_initial_margin_with_orders,Total_collateral_value,
 * total_initial_margin_with_orders = sum ( position_notional_with_orders_i * IMR_i (with_orders)),
 * IMR_i (with_orders) = Max(1 / Max Account Leverage, Base IMR i, IMR Factor i * Abs(Position Notional i + Order Notional i)^(4/5)),
 * position_notional_with_orders_i = abs( mark_price_i * position_qty_with_orders_i),
 * position_qty_with_orders_i = max[ abs(position_qty_i + sum_position_qty_buy_orders_i), abs(position_qty_i - sum_position_qty_sell_orders_i)]
 * @description
 *
 * ## Definition
 *
 * **Free collateral**: Total value of available margin in the user's account (denominated in USDC)
 *
 * **Total_collateral_value**: Total value of collateral assets in the user's account (denominated in USDC)
 *
 * **total_initial_margin_with_orders**: Total initial margin used by the user (including positions and orders)
 *
 * **initial_margin_i with order**: Initial margin for symbol i (considering both positions and orders)
 *
 * **IMR_i (with_orders)**: Initial margin rate for a single symbol (considering both position and order notional)
 *
 * **Max Account Leverage**: Maximum leverage set by the user, from `/v1/client/info.max_leverage`
 *
 * **Base IMR i**: Base initial margin rate for a single symbol, from `/v1/public/info`
 *
 * **IMR Factor i**: IMR calculation factor for a single symbol, from `v1/client/info`
 *
 * **Position Notional i**: Sum of position notional for a single symbol
 *
 * **Order Notional i**: Sum of order notional for a single symbol
 *
 * **position_notional_with_orders_i**: Sum of position and order notional for a single symbol
 *
 * **mark_price_i**: Mark price for a single symbol
 *
 * **position_qty_with_orders_i**: Sum of position and order quantity for a single symbol
 *
 * **position_qty_i**: Position quantity for a single symbol
 *
 * **sum_position_qty_buy_orders_i**: Sum of long order quantity for a single symbol [algo orders should be ignored]
 *
 * **sum_position_qty_sell_orders_i**: Sum of short order quantity for a single symbol [algo orders should be ignored]
 *
 * ## Example
 *
 * ```
 * BTC-PERP position_qty_with_orders_i = max[ abs(0.2+0.3) , abs(0.2-0.5) ] = 0.5
 * ETH-PERP position_qty_with_orders_i = max[ abs(-3+0), abs(-3+0)] = 3
 *
 * BTC-PERP position_notional_with_orders_i = 0.5 * 25986.2 = 12993.1
 * ETH-PERP position_notional_with_orders_i = 3 * 1638.41 = 4915.23
 *
 * BTC-PERP IMR_i (with_orders) = Max(
 *   1 / Max Account Leverage = 1 / 10 = 0.1
 *   Base IMR i = 0.1
 *   IMR Factor i * Abs(Position Notional i + Order Notional i)^(4/5)) = 0.0000002512 * Abs(5197.2 + 7200 - 14000)^(4/5) = 9.20286609e-5
 * ) = 0.1
 *
 * ETH-PERP IMR_i (with_orders) = Max(
 *   1 / Max Account Leverage = 1 / 10 = 0.1
 *   Base IMR i = 0.1
 *   IMR Factor i * Abs(Position Notional i + Order Notional i)^(4/5)) = 0.0000003754 * Abs(-4915.23)^(4/5) = 0.00649875988
 * ) = 0.1
 *
 * total_initial_margin_with_orders = 12993.1 * 0.1 + 4915.23 * 0.1 = 1790.833
 * Total_collateral_value = 1981.66
 * Free Collateral = 1981.66 - 1790.833 = 190.82700
 * ```
 */
export function freeCollateral(inputs: {
  totalCollateral: Decimal;
  totalInitialMarginWithOrders: number;
}): Decimal {
  const value = inputs.totalCollateral.sub(inputs.totalInitialMarginWithOrders);
  // free collateral cannot be less than 0
  return value.isNegative() ? zero : value;
}

/**
 * @formulaId totalCollateral
 * @name Total Collateral
 * @formula Total collateral = usdc balance.holding + SUM(non-usdc balance.holding * mark price * discount) + total unsettlement PNL
 * @description
 *
 * ## Definition
 *
 * **discount**: Collateral substitution rate
 *
 * **Total collateral**: Total value of collateral assets in the user's account (denominated in USDC)
 *
 * **usdc balance.holding**: USDC holding quantity
 *
 * **non-usdc balance.holding * mark price**: Value of non-USDC asset holdings (denominated in USDC)
 *
 * **holding**: Asset quantity held by the user, from `/v1/client/holding` or v2 Websocket API | Balance
 *
 * **mark price**: Current price of the asset, from v2 Websocket API | Balance
 *
 * **total unsettlement PNL**: Sum of user's account unsettled PNL
 *
 * ## Example
 *
 * ```
 * Total collateral = 2000 + 1000 * 1.001 * 0 - 18.34 = 1981.66
 * total unsettlement PNL = -18.34
 * ```
 */
export function totalCollateral(inputs: {
  USDCHolding: number;
  nonUSDCHolding: {
    holding: number;
    indexPrice: number;
    collateralCap: number;
    collateralRatio: Decimal;
  }[];
  /**
   * Sum of user's account unsettled PNL
   */
  unsettlementPnL: number;
}): Decimal {
  const { USDCHolding, nonUSDCHolding, unsettlementPnL } = inputs;
  const nonUSDCHoldingValue = nonUSDCHolding.reduce<Decimal>((acc, cur) => {
    const finalHolding = Math.min(cur.holding, cur.collateralCap);
    const value = new Decimal(finalHolding)
      .mul(cur.collateralRatio)
      .mul(cur.indexPrice);
    return acc.add(value);
  }, zero);

  return new Decimal(USDCHolding).add(nonUSDCHoldingValue).add(unsettlementPnL);
}

export function initialMarginWithOrder() {}

/**
 * Sum of notional value for a symbol's position and orders.
 */
export function positionNotionalWithOrder_by_symbol(inputs: {
  markPrice: number;
  positionQtyWithOrders: number;
}): Decimal {
  return new Decimal(inputs.markPrice).mul(inputs.positionQtyWithOrders);
}

/**
 *  Sum of position quantity and orders quantity for a symbol.
 */
export function positionQtyWithOrders_by_symbol(inputs: {
  positionQty: number;
  // Total quantity of buy orders for a symbol
  buyOrdersQty: number;
  // Total quantity of sell orders for a symbol
  sellOrdersQty: number;
}): number {
  const { positionQty, buyOrdersQty, sellOrdersQty } = inputs;
  const positionQtyDecimal = new Decimal(positionQty);
  const qty = Math.max(
    positionQtyDecimal.add(buyOrdersQty).abs().toNumber(),
    positionQtyDecimal.sub(sellOrdersQty).abs().toNumber(),
  );

  return qty;
}

/**
 * @formulaId imr
 * @description
 * Initial margin rate for a symbol.
 * Max(1 / Max Account Leverage, Base IMR i, IMR Factor i * Abs(Position Notional i + Order Notional i)^(4/5))
 */
export function IMR(inputs: {
  /**
   * effective max leverage
   */
  maxLeverage: number;
  baseIMR: number;
  IMR_Factor: number;
  positionNotional: number;
  ordersNotional: number;
  IMR_factor_power?: number;
}): number {
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

/**
 * @deprecated
 * Calculate the total initial margin used by the user (including positions and orders).
 */
export function totalInitialMarginWithOrders(inputs: {
  positions: API.Position[];
  orders: API.Order[];
  // account: API.AccountInfo;
  markPrices: { [key: string]: number };
  symbolInfo: any;
  IMR_Factors: { [key: string]: number };
  maxLeverage: number;
}): number {
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
  /**
   * account max leverage
   */
  maxLeverage: number;
}) {
  const { positions, markPrices, IMR_Factors, symbolInfo } = inputs;
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
      maxLeverage: maxLeverage({
        symbolLeverage: position?.leverage ?? inputs.maxLeverage,
        accountLeverage: inputs.maxLeverage,
      }),
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

/**
 * Total margin used by other symbols (except the current symbol).
 */
export function otherIMs(inputs: {
  // the position list for other symbols except the current symbol
  positions: API.Position[];
  markPrices: { [key: string]: number };
  /**
   * account max leverage
   */
  maxLeverage: number;
  symbolInfo: any;
  IMR_Factors: { [key: string]: number };
}): number {
  const {
    // orders,
    positions,
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

      // IMR_Factor is possible to be 0
      if (typeof IMR_Factor === "undefined") {
        console.warn("IMR_Factor is not found:", symbol);
        return acc;
      }

      const imr = IMR({
        maxLeverage: maxLeverage({
          symbolLeverage: position!.leverage,
          accountLeverage: inputs.maxLeverage,
        }),
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

  /**
   * @description Maximum quantity limit for opening a single position, /v1/public/info.base_max
   */
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
 * @formulaId maxQty
 * @name Max Order QTY
 * @description
 * ## Max Long Quantity Formula
 *
 * ```
 * max long qty = MIN (
 *   base max,
 *   (((Total_collateral_value - Other_IMs) / (Max(1 / Max Account Leverage, Base IMR i) + 2 * futures_take_fee_rate * 0.0001) / mark_price_i) * 0.995 - position_qty_this_symbol - sum_buy_order_qty_this_symbol),
 *   ((((Total_collateral_value - Other_IMs) / IMR Factor i)^(1/1.8)) / mark_price_i - position_qty_this_symbol - sum_buy_order_qty_this_symbol) / (1 + 2 * futures_take_fee_rate * 0.0001) * 0.995
 * )
 * ```
 *
 * ## Max Short Quantity Formula
 *
 * ```
 * max short qty = MIN (
 *   base max,
 *   (((Total_collateral_value - Other_IMs) / (Max(1 / Max Account Leverage, Base IMR i) + 2 * futures_take_fee_rate * 0.0001) / mark_price_i) * 0.995 + position_qty_this_symbol - sum_sell_order_qty_this_symbol),
 *   ((((Total_collateral_value - Other_IMs) / IMR Factor i)^(1/1.8)) / mark_price_i + position_qty_this_symbol - sum_sell_order_qty_this_symbol) / (1 + 2 * futures_take_fee_rate * 0.0001) * 0.995
 * )
 * ```
 *
 * ## Reduce Only Mode
 *
 * When reduce only is enabled:
 * - If `position_qty_i > 0`: max long qty = 0, max short qty = abs(position_qty_i)
 * - If `position_qty_i < 0`: max long qty = abs(position_qty_i), max short qty = 0
 * - If `position_qty_i = 0`: max long qty = 0, max short qty = 0
 *
 * ## Variable Definitions
 *
 * | Variable | Description | API Reference |
 * |----------|-------------|---------------|
 * | `max long qty` | Maximum long quantity for current symbol | |
 * | `max short qty` | Maximum short quantity for current symbol | |
 * | `base_max` | Maximum quantity limit for opening a single position | `/v1/public/info.base_max` |
 * | `Total_collateral_value` | Total value of collateral assets in user account (USDC denominated) | |
 * | `Other_IMs` | Initial margin occupied by all other symbols excluding current symbol | |
 * | `IMR_i (with_orders)` | Initial margin rate for a single symbol (considering both position/orders notional) | |
 * | `Max Account Leverage` | Maximum leverage set by user | `/v1/client/info.max_leverage` |
 * | `Base IMR i` | Base initial margin rate for a single symbol | `/v1/public/info` |
 * | `IMR Factor i` | IMR calculation factor for a single symbol | `v1/client/info` |
 * | `Position Notional i` | Sum of position notional for a single symbol | |
 * | `Order Notional i` | Sum of order notional for a single symbol | |
 * | `position_notional_with_orders_i` | Sum of position/orders notional for a single symbol | |
 * | `mark_price_i` | Mark price for a single symbol | |
 * | `position_qty_with_orders_i` | Sum of position/orders quantity for a single symbol | |
 * | `position_qty_i` | Position quantity for a single symbol | |
 * | `sum_position_qty_buy_orders_i` | Sum of long order quantity for a single symbol [algo orders ignored] | |
 * | `sum_position_qty_sell_orders_i` | Sum of short order quantity for a single symbol [algo orders ignored] | |
 * | `futures_take_fee_rate` | User's futures taker fee rate | `GET /v1/client/info` |
 *
 * ## Calculation Details
 *
 * ```
 * Other_IMs = sum(position_notional_with_orders_i * IMR_i (with_orders)) // excluding current symbol
 *
 * IMR_i (with_orders) = Max(1 / Max Account Leverage, Base IMR i, IMR Factor i * Abs(Position Notional i + Order Notional i)^(4/5))
 *
 * position_notional_with_orders_i = abs(mark_price_i * position_qty_with_orders_i)
 *
 * position_qty_with_orders_i = max[abs(position_qty_i + sum_position_qty_buy_orders_i), abs(position_qty_i - sum_position_qty_sell_orders_i)]
 * ```
 *
 * ## Example Calculation
 *
 * **Given:**
 * - `futures_take_fee_rate = 8`
 * - `BTC base max = 20`
 * - `Total_collateral_value = 1981.66`
 * - `Other_IMs = ETH Initial Margin = 4915.23 * 0.1 = 491.523`
 * - `BTC mark_price_i = 25986.2`
 * - `BTC position_qty_this_symbol = 0.2`
 * - `sum_buy_order_qty_this_symbol = 0.3`
 * - `sum_sell_order_qty_this_symbol = -0.5`
 *
 * **Max Long Quantity:**
 * ```
 * max long qty = MIN(
 *   20 BTC,
 *   ((1981.66 - 491.523) / (0.1 + 2 * 8 * 0.0001) / 25986.2 * 0.995 - 0.2 - 0.3) = 0.0615815026 BTC,
 *   ((((1981.66 - 491.523) / 0.0000002512)^(1/1.8)) / 25986.2 - 0.2 - 0.3) / (1 + 2 * 8 * 0.0001) * 0.995 = 9.78216039 BTC
 * ) = 0.0615815026 BTC
 * ```
 *
 * **Max Short Quantity:**
 * ```
 * max short qty = MIN(
 *   20 BTC,
 *   ((1981.66 - 491.523) / (0.1 + 2 * 8 * 0.0001) / 25986.2 * 0.995 + 0.2 - 0.5) = 0.261581503 BTC,
 *   ((((1981.66 - 491.523) / 0.0000002512)^(1/1.8)) / 25986.2 + 0.2 - 0.5) / (1 + 2 * 8 * 0.0001) * 0.995 = 9.98084249726 BTC
 * ) = 0.261581503 BTC
 * ```
 *
 * ## Additional Examples
 *
 * **Base max qty calculation:**
 * ```
 * Base max qty = (1981.66 - 491.523) / (0.1 + 2 * 8 * 0.0001) / 25986.2 * 0.995 = 0.561581503 BTC
 * ```
 *
 * **Different position scenarios:**
 *
 * 1. **Short position -0.3 BTC:**
 *    - max long qty = 0.561581503 - (-0.3) = 0.861581503
 *    - max short qty = 0.561581503 + (-0.3) = 0.261581503
 *
 * 2. **Short position -0.3 BTC + sell orders 0.1:**
 *    - max long qty = 0.561581503 - (-0.3) = 0.861581503
 *    - max short qty = 0.561581503 + (-0.3) - 0.1 = 0.161581503
 *
 * 3. **Long position 0.3 BTC + buy orders 0.2 + sell orders 0.1:**
 *    - max long qty = 0.561581503 - 0.3 - 0.2 = 0.061581503
 *    - max short qty = 0.561581503 + 0.3 - 0.1 = 0.761581503
 *
 * ## Special Case: Insufficient Collateral
 *
 * When `totalCollatValue <= newTotalIM`:
 *
 * ```
 * newOrderSize_iter = ITERATE() return max(0, newOrderSize_iter * 99.5% + others)
 * ```
 *
 * **ITERATE() Algorithm:**
 * ```
 * ITERATE() {
 *     iteratorLeverage = min(1 / Max Account Leverage, Base IMR i)
 *     iteratorStep = 2
 *
 *     // First iteration (30 times)
 *     for (i = 0; i < 30; i++) {
 *         iteratorLeverage = max(0, iteratorLeverage - iteratorStep)
 *         newOrderSize1 = (adjustedCollateral - othersIM) * iteratorLeverage / markPrice
 *         calculate afterTradeIM
 *         if (adjustedCollateral >= afterTradeIM) break
 *     }
 *
 *     leftLeverage = iteratorLeverage
 *     rightLeverage = min(maxLeverage_account, leftLeverage + iteratorStep)
 *
 *     // Binary search (30 times)
 *     for (i = 0; i < 30; i++) {
 *         midLeverage = (leftLeverage + rightLeverage) / 2
 *         newOrderSize2 = (adjustedCollateral - othersIM) * midLeverage / markPrice
 *         calculate afterTradeIM
 *         precision = (adjustedCollateral - afterTradeIM) / adjustedCollateral
 *
 *         if (adjustedCollateral > afterTradeIM) {
 *             leftLeverage = midLeverage
 *             if (0 <= precision <= 0.5%) break
 *         } else {
 *             rightLeverage = midLeverage
 *         }
 *     }
 *
 *     return newOrderSize2
 * }
 * ```
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

    if (IMR_Factor === 0) {
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
      .sub(Math.abs(sellOrdersQty))
      .toNumber();

    if (positionQty === 0 && sellOrdersQty === 0) {
      return Math.min(baseMaxQty, factor_1);
    }

    if (IMR_Factor === 0) {
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

/**
 * total margin ratio
 */
export function totalMarginRatio(
  inputs: {
    totalCollateral: number;
    markPrices: { [key: string]: number };
    positions: API.Position[];
  },
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

/**
 * @formulaId totalUnrealizedROI
 * @name Total Unrealized ROI
 * @formula Total Unrealized ROI = Total Unrealized PNL / ( Total Value - Total Unrealized PNL ) * 100%
 * @description
 *
 * ## Definition
 *
 * **Total Unrealized PNL** = Sum of unrealized profit and loss for all current positions of the user
 *
 * **Total Value** = User's total asset value (denominated in USDC), including assets that cannot be used as collateral
 *
 * ## Example
 *
 * ```
 * Total Unrealized ROI = 200.53 / ( 2982.66 - 200.53 ) * 100% = 7.21%
 * Total Unrealized PNL = 200.53
 * Total Value = 2982.66
 * ```
 */
export function totalUnrealizedROI(inputs: {
  totalUnrealizedPnL: number;
  totalValue: number;
}) {
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

export function availableBalance(inputs: {
  USDCHolding: number;
  unsettlementPnL: number;
}) {
  const { USDCHolding, unsettlementPnL } = inputs;

  return new Decimal(USDCHolding).add(unsettlementPnL).toNumber();
}

/**
 * @formulaId mmr
 * @name Total Maintenance Margin Ratio
 * @formula Total Maintenance Margin Ratio = sum(Position maintenance margin) / total_position_notional * 100%, total_position_notional = sum(abs(position_qty_i * mark_price_i))
 * @description
 *
 * ## Definition
 *
 * **Total Maintenance Margin Ratio** = User's account maintenance margin ratio
 *
 * **sum(Position maintenance margin)** = Total maintenance margin of all user positions (denominated in USDC)
 *
 * **total_position_notional** = Sum of notional value of current positions
 *
 * **position_qty_i** = Position quantity for a single symbol
 *
 * **mark_price_i** = Mark price for a single symbol
 *
 * ## Example
 *
 * ```
 * Total Margin Ratio = 505.61 / 10112.43 * 100% = 4.99988628%
 * total_position_notional = 10112.43
 * abs(BTC position notional) = 5197.2
 * abs(ETH position notional) = 4915.23
 * sum(Position maintenance margin) = 505.61
 * BTC position MM = 259.86
 * ETH position MM = 245.75
 * ```
 *
 * @param inputs AccountMMRInputs
 * @returns number|null
 */
export function MMR(inputs: {
  // Total Maintenance Margin of all positions of the user (USDC)
  positionsMMR: number;
  /**
   * Notional sum of all positions,
   * positions.totalNotional()
   */
  positionsNotional: number;
}): number | null {
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
  collateralCap: number;
  indexPrice: number;
}) => {
  const {
    baseWeight,
    discountFactor,
    collateralQty,
    collateralCap,
    indexPrice,
  } = params;

  // if collateralCap is -1, it means the collateral is unlimited
  const cap = collateralCap === -1 ? collateralQty : collateralCap;

  const K = new Decimal(1.2);
  const DCF = new Decimal(discountFactor || 0);
  const qty = new Decimal(Math.min(collateralQty, cap));

  const notionalAbs = qty.mul(indexPrice).abs();
  const dynamicWeight = DCF.mul(notionalAbs.toPower(IMRFactorPower));
  const result = K.div(new Decimal(1).add(dynamicWeight));

  return result.lt(baseWeight) ? result : new Decimal(baseWeight);
};

/** collateral_value_i = min(collateral_qty_i , collateral_cap_i) * weight_i * index_price_i */
export const collateralContribution = (params: {
  collateralQty: number;
  collateralCap: number;
  collateralRatio: number;
  indexPrice: number;
}) => {
  const { collateralQty, collateralCap, collateralRatio, indexPrice } = params;

  // if collateralCap is -1, it means the collateral is unlimited
  const cap = collateralCap === -1 ? collateralQty : collateralCap;

  return new Decimal(Math.min(collateralQty, cap))
    .mul(collateralRatio)
    .mul(indexPrice)
    .toNumber();
};

export const LTV = (params: {
  usdcBalance: number;
  upnl: number;
  assets: Array<{ qty: number; indexPrice: number; weight: number }>;
}) => {
  const { usdcBalance, upnl, assets } = params;

  const usdcLoss = new Decimal(Math.min(usdcBalance, 0)).abs();
  const upnlLoss = new Decimal(Math.min(upnl, 0)).abs();
  const numerator = usdcLoss.add(upnlLoss);

  const collateralSum = assets.reduce<Decimal>((acc, asset) => {
    return acc.add(
      new Decimal(Math.max(asset.qty, 0))
        .mul(new Decimal(asset.indexPrice))
        .mul(new Decimal(asset.weight)),
    );
  }, zero);

  const denominator = collateralSum.add(new Decimal(Math.max(upnl, 0)));

  if (numerator.isZero() || denominator.isZero()) {
    return 0;
  }

  return numerator.div(denominator).toNumber();
};

/**
 * max(0, min(USDC_balance, free_collateral - max(upnl, 0)))
 */
export const maxWithdrawalUSDC = (inputs: {
  USDCBalance: number;
  freeCollateral: Decimal;
  upnl: number;
}) => {
  const { USDCBalance, freeCollateral, upnl } = inputs;
  const value = Math.min(
    new Decimal(USDCBalance).toNumber(),
    new Decimal(freeCollateral).sub(Math.max(upnl, 0)).toNumber(),
  );
  return Math.max(0, value);
};

/**
 *
 * Other collateral: min(collateral_qty_i, free_collateral / (index_price_i × weight_i)
 * Other collateral with negative USDC: min(collateral_qty_i, free_collateral / (index_price_i × (1 + buffer) × weight_i)
 * buffer: 0.2%
 */
export const maxWithdrawalOtherCollateral = (inputs: {
  USDCBalance: number;
  collateralQty: number;
  freeCollateral: Decimal;
  indexPrice: number;
  weight: Decimal;
}) => {
  const { USDCBalance, collateralQty, freeCollateral, indexPrice, weight } =
    inputs;
  const usdcBalance = new Decimal(USDCBalance);
  const denominator = usdcBalance.isNegative()
    ? new Decimal(indexPrice).mul(weight).mul(new Decimal(1).add(0.002))
    : new Decimal(indexPrice).mul(weight);
  if (denominator.isZero()) {
    return zero;
  }
  const qty = new Decimal(collateralQty);
  const maxQtyByValue = new Decimal(freeCollateral).div(denominator);
  return maxQtyByValue.lt(qty) ? maxQtyByValue : qty;
};

export const calcMinimumReceived = (inputs: {
  amount: number;
  slippage: number;
}) => {
  const { amount, slippage } = inputs;
  const slippageRatio = new Decimal(slippage).div(100);
  return new Decimal(amount)
    .mul(new Decimal(1).minus(slippageRatio))
    .toNumber();
};

/**
 * @deprecated This method will be removed soon. Please update your code to use symbolLeverage directly.
 */
// Warning: The maxLeverage method will be deprecated soon. Please use symbolLeverage directly and update all related calls as soon as possible.
export const maxLeverage = (inputs: {
  symbolLeverage?: number;
  accountLeverage: number;
}) => {
  const { symbolLeverage, accountLeverage } = inputs;

  return symbolLeverage ?? 1;
};
