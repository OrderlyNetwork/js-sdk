import Decimal from "decimal.js-light";

/**
 * 仓位价值
 * @param qty 数量
 * @param price 价格
 */
export function notional(qty: number, price: number): number {
  return new Decimal(qty).mul(price).abs().toNumber();
}

/**
 * 未实现盈亏
 * @param qty 数量
 * @param price 价格
 */
export function unrealPnl(qty: number, price: number): number {
  return 0;
}

export function liqPrice(qty: number) {
  return 0;
}
