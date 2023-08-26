import { API } from "@orderly/types";
import { Decimal } from "@orderly/utils";

/**
 * 单个仓位价值
 * @param qty 数量
 * @param price 价格
 */
export function notional(qty: number, price: number): number {
  return new Decimal(qty).mul(price).abs().toNumber();
}

/**
 * 所有仓位价值
 * @param positions
 * @returns
 *
 * @link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Total-Notional
 */
export function totalNotional(positions: API.Position[]): number {
  return positions.reduce((acc, cur) => {
    return acc + notional(cur.position_qty, cur.average_open_price);
  }, 0);
}

export type UnrealPnLInputs = {
  markPrice: number;
  openPrice: number;
  qty: number;
};

/**
 * 单个仓位未实现盈亏
 * @param qty 数量
 * @param price 价格
 */
export function unrealizedPnL(inputs: UnrealPnLInputs): number {
  return new Decimal(inputs.qty)
    .mul(inputs.markPrice - inputs.openPrice)
    .toNumber();
}

/**
 * 所有仓位未实现盈亏
 * @param inputs
 */
export function totalUnrealizedPnL(positions: API.Position[]): number {
  return positions.reduce((acc, cur) => {
    return (
      acc +
      unrealizedPnL({
        qty: cur.position_qty,
        openPrice: cur.average_open_price,
        markPrice: cur.mark_price,
      })
    );
  }, 0);
}

/**
 * 单个仓位强平价格
 * @param qty
 * @returns
 *
 * @link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Position-Liq.-Price
 */
export function liqPrice(qty: number) {
  return 0;
}

export type UnsettlementPnLInputs = {
  positionQty: number;
  markPrice: number;
  costPosition: number;
  sumUnitaryFunding: number;
  lastSumUnitaryFunding: number;
};
/**
 * 计算每个仓位未结算 PnL
 * @link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Total-Unsettlement-PNL-%5BinlineExtension%5D
 */
export function unsettlementPnL(inputs: UnsettlementPnLInputs): number {
  const {
    positionQty,
    markPrice,
    costPosition,
    sumUnitaryFunding,
    lastSumUnitaryFunding,
  } = inputs;

  const qty = new Decimal(positionQty);

  return qty
    .mul(markPrice)
    .sub(costPosition)
    .sub(qty.mul(new Decimal(sumUnitaryFunding).sub(lastSumUnitaryFunding)))
    .toNumber();
}

export type TotalUnsettlementPnLInputs = {
  positions: (API.Position & {
    sum_unitary_funding: number;
  })[];
  sumUnitaryFunding: number;
};
/**
 * 计算所有仓位未结算 PnL
 * @param inputs
 * @returns
 * @link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Total-Unsettlement-PNL-%5BinlineExtension%5D
 */
export function totalUnsettlementPnL(
  positions: (API.Position & {
    sum_unitary_funding: number;
  })[]
): number {
  return positions.reduce((acc, cur) => {
    return (
      acc +
      unsettlementPnL({
        positionQty: cur.position_qty,
        markPrice: cur.mark_price,
        costPosition: cur.cost_position,
        sumUnitaryFunding: cur.sum_unitary_funding,
        lastSumUnitaryFunding: cur.last_sum_unitary_funding,
      })
    );
  }, 0);
}
