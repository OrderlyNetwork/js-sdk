import Decimal from "decimal.js-light";

export type FreeCollateralInputs = {
  // 总保证金
  totalCollateralValue: number;
  // 总初始保证金
  totalInitialMarginWithOrders: number;
};
/**
 * 计算可用保证金
 * @param inputs
 * @returns
 */
export function freeCollateral(inputs: FreeCollateralInputs): number {
  return inputs.totalCollateralValue - inputs.totalInitialMarginWithOrders;
}

export type TotalCollateralValueInputs = {
  // 总余额
  totalBlanceUSDC: number;
  // 未结算盈亏
  unsettlementPnL: number;
};
/**
 * 计算总保证金
 * @param inputs
 * @returns
 */
export function totalCollateralValue(
  inputs: TotalCollateralValueInputs
): number {
  return inputs.totalBlanceUSDC + inputs.unsettlementPnL;
}

export type UnsettlementPnLInputs = {
  positionQty: number;
  markPrice: number;
  costPosition: number;
  sumUnitaryFunding: number;
  lastSumUnitaryFunding: number;
};
/**
 * 计算未结算盈亏
 */
export function unsettlementPnL(inputs: UnsettlementPnLInputs): number {
  const {
    positionQty,
    markPrice,
    costPosition,
    sumUnitaryFunding,
    lastSumUnitaryFunding,
  } = inputs;

  const qty = new Decimal(positionQty).abs();

  return qty
    .mul(markPrice)
    .sub(costPosition)
    .sub(qty.mul(new Decimal(sumUnitaryFunding).sub(lastSumUnitaryFunding)))
    .toNumber();
}

export function initialMarginWithOrder() {}

/**
 * 單一 Symbol position / orders notional 加總
 */
export function positionNotionalWithOrder() {}

export type TotalInitialMarginWithOrdersInputs = {};

/**
 * 计算用戶已使用初始保證金加總 ( 包含 position / orders )
 * @param inputs
 * @returns
 */
export function totalInitialMarginWithOrders(
  inputs: TotalInitialMarginWithOrdersInputs
): number {
  return 0;
}

export type MaxQtyInputs = {};

export function maxQty(inputs: MaxQtyInputs): number {
  return 0;
}
