import { API } from "@orderly.network/types";
import { Decimal } from "@orderly.network/utils";
import { IMRFactorPower } from "./constants";

/**
 * 单个仓位价值
 * @param qty 数量
 * @param mark_price 价格
 */
export function notional(qty: number, mark_price: number): number {
  return new Decimal(qty).mul(mark_price).abs().toNumber();
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
    return acc + notional(cur.position_qty, cur.mark_price);
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

export type LiqPriceInputs = {
  markPrice: number;
  totalCollateral: number;
  positionQty: number;
  MMR: number;
};

/**
 * 单个仓位强平价格
 *
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Position-Liq.-Price}
 */
export function liqPrice(inputs: LiqPriceInputs): number {
  console.log("liqPrice:::::", inputs);
  const { markPrice, totalCollateral, positionQty, MMR } = inputs;
  const totalNotional = notional(positionQty, markPrice);

  if (positionQty === 0) {
    return 0;
  }

  return Math.max(
    new Decimal(markPrice)
      .add(
        new Decimal(totalCollateral)
          .sub(new Decimal(totalNotional).mul(MMR))
          .div(new Decimal(positionQty).abs().mul(MMR).sub(positionQty))
      )
      // .todp(4, Decimal.ROUND_DOWN)
      .toNumber(),
    0
  );
}

export type MMInputs = {
  positionQty: number;
  markPrice: number;
  MMR: number;
};

export function maintenanceMargin(inputs: MMInputs) {
  const { positionQty, markPrice, MMR } = inputs;

  return new Decimal(positionQty).mul(markPrice).mul(MMR).abs().toNumber();
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
  if (!Array.isArray(positions) || positions.length === 0) {
    return 0;
  }

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

/**
 * 计算仓位强平价格
 * @see {@link https://wootraders.atlassian.net/wiki/spaces/WOOFI/pages/346030144/v2#Position-Liq.-Price}
 */
export function MMR(inputs: {
  baseMMR: number;
  baseIMR: number;
  IMRFactor: number;
  positionNotional: number;
  IMR_factor_power: number;
}): number {
  console.log(inputs);

  const {
    baseMMR,
    baseIMR,
    IMRFactor,
    positionNotional,
    IMR_factor_power = IMRFactorPower,
  } = inputs;
  return Math.max(
    baseMMR,
    new Decimal(baseMMR)
      .div(baseIMR)
      .mul(IMRFactor)
      .mul(Math.abs(positionNotional))
      .toPower(IMR_factor_power)
      .toNumber()
  );
}
