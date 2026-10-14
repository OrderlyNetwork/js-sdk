import { propOr } from "ramda";
import { account, positions } from "@orderly.network/perp";
import { API, MarginMode } from "@orderly.network/types";
import { Decimal, zero } from "@orderly.network/utils";
import type { CalculatorCtx } from "../../types";

/** Shared position math for current and observed subaccounts. */
export function formatPositions(
  data: API.PositionInfo | API.PositionsTPSLExt,
  ctx: Pick<
    CalculatorCtx,
    "accountInfo" | "symbolsInfo" | "fundingRates" | "portfolio"
  >,
): API.PositionsTPSLExt {
  const { accountInfo, symbolsInfo, fundingRates, portfolio } = ctx;

  if (!accountInfo || !fundingRates || !symbolsInfo) {
    return data as API.PositionsTPSLExt;
  }

  let unrealPnL_total = zero,
    unrealPnL_total_index = zero,
    notional_total = zero,
    unsettlementPnL_total = zero,
    totalUnsettledIsolatedPnl = zero,
    totalUnsettledCrossPnl = zero;

  let rows = data.rows.map((item) => {
    const info = symbolsInfo[item.symbol];
    const notional = positions.notional(item.position_qty, item.mark_price);

    // Account equity does not depend on the symbol's risk configuration.
    const unsettlementPnL = positions.unsettlementPnL({
      positionQty: item.position_qty,
      markPrice: item.mark_price,
      costPosition: item.cost_position,
      sumUnitaryFunding: propOr(
        0,
        "sum_unitary_funding",
        fundingRates[item.symbol],
      ),
      lastSumUnitaryFunding: item.last_sum_unitary_funding ?? 0,
    });
    unsettlementPnL_total = unsettlementPnL_total.add(unsettlementPnL);
    // The isolated split only feeds equity totals (no downstream consumer
    // spends it), so it is safe to accumulate for config-less rows too.
    // The cross split below deliberately stays config-gated instead: it
    // feeds totalCollateral (spendable cross margin) via
    // portfolio.total_unsettled_cross_pnl, and rows without trusted symbol
    // config must never inflate collateral.
    if (item.margin_mode === MarginMode.ISOLATED) {
      totalUnsettledIsolatedPnl =
        totalUnsettledIsolatedPnl.add(unsettlementPnL);
    }

    // Rows without symbol config (e.g. BINARY symbols, which never appear
    // in /v1/public/info) cannot run the perps risk formulas.
    // mm is stamped 0 (PRD fixes binary mmr=0, never liquidates) so the
    // row honours the PositionExt contract instead of carrying undefined
    // into mm consumers like useMarginRatio.
    if (!info) {
      return {
        ...item,
        mm: 0,
        notional,
        unsettled_pnl: unsettlementPnL,
        unsettlement_pnl: unsettlementPnL,
      };
    }

    const sum_unitary_funding =
      fundingRates?.[item.symbol]?.["sum_unitary_funding"] ?? 0;

    const unrealPnl = positions.unrealizedPnL({
      qty: item.position_qty,
      openPrice: item?.average_open_price,
      // markPrice: unRealizedPrice,
      markPrice: item.mark_price,
    });
    let unrealPnl_index = 0,
      unrealPnlROI_index = 0;

    const maxLeverage = item.leverage || 1;

    const imr = account.IMR({
      maxLeverage,
      baseIMR: info?.["base_imr"],
      IMR_Factor: accountInfo.imr_factor[item.symbol] as number,
      positionNotional: notional,
      ordersNotional: 0,
      IMR_factor_power: 4 / 5,
    });

    const unrealPnlROI = positions.unrealizedPnLROI({
      positionQty: item.position_qty,
      openPrice: item.average_open_price,
      IMR: imr,
      unrealizedPnL: unrealPnl,
    });

    if (item.index_price) {
      unrealPnl_index = positions.unrealizedPnL({
        qty: item.position_qty,
        openPrice: item?.average_open_price,
        // markPrice: unRealizedPrice,
        markPrice: item.index_price,
      });

      unrealPnlROI_index = positions.unrealizedPnLROI({
        positionQty: item.position_qty,
        openPrice: item.average_open_price,
        IMR: imr,
        unrealizedPnL: unrealPnl_index,
      });
    }

    const MMR = positions.MMR({
      baseMMR: info?.["base_mmr"],
      baseIMR: info?.["base_imr"],
      IMRFactor: accountInfo.imr_factor[item.symbol] as number,
      positionNotional: notional,
      IMR_factor_power: 4 / 5,
    });

    unrealPnL_total = unrealPnL_total.add(unrealPnl);
    unrealPnL_total_index = unrealPnL_total_index.add(unrealPnl_index);
    notional_total = notional_total.add(notional);

    // Collateral-affecting accumulation: intentionally NOT hoisted above
    // the !info gate like the equity totals — see the comment there.
    if (item.margin_mode === MarginMode.CROSS) {
      totalUnsettledCrossPnl = totalUnsettledCrossPnl.add(unsettlementPnL);
    }

    const fundingFee = new Decimal(sum_unitary_funding)
      .sub(item.last_sum_unitary_funding ?? 0)
      .mul(item.position_qty)
      .negated()
      .toNumber();

    return {
      ...item,
      fundingFee,
      mm: positions.maintenanceMargin({
        positionQty: item.position_qty,
        markPrice: item.mark_price,
        MMR,
      }),
      mmr: MMR,
      notional,
      unsettlement_pnl: unsettlementPnL,
      unrealized_pnl: unrealPnl,
      unrealized_pnl_index: unrealPnl_index,
      unrealized_pnl_ROI: unrealPnlROI,
      unrealized_pnl_ROI_index: unrealPnlROI_index,
      unsettled_pnl: unsettlementPnL,
    };
  });

  const totalUnrealPnl = unrealPnL_total.toNumber();
  const totalUnrealPnl_index = unrealPnL_total_index.toNumber();
  const unsettlementPnL = unsettlementPnL_total.toNumber();
  let totalUnrealizedROI = 0,
    totalUnrealizedROI_index = 0;

  if (portfolio) {
    const { totalValue, totalCollateral: crossMarginCollateral } = portfolio;

    rows = rows.map((item) => {
      const info = symbolsInfo[item.symbol];

      if (!info) return item;

      // NOTE: Calculate totalCollateral based on marginMode.
      // If margin mode is ISOLATED, use isolated margin plus unsettlementPnL;
      // otherwise (CROSS margin), use account total collateral value.
      const totalCollateral =
        item.margin_mode === MarginMode.ISOLATED
          ? new Decimal(item.margin ?? 0)
              .add(item.unsettlement_pnl ?? 0)
              .toNumber()
          : crossMarginCollateral.toNumber();

      let est_liq_price;
      if (item.margin_mode === MarginMode.ISOLATED) {
        est_liq_price = positions.liquidationPriceIsolated({
          isolatedPositionMargin: item.margin ?? 0,
          costPosition: item.cost_position ?? 0,
          positionQty: item.position_qty ?? 0,
          sumUnitaryFunding:
            fundingRates?.[item.symbol]?.["sum_unitary_funding"] ?? 0,
          lastSumUnitaryFunding: item.last_sum_unitary_funding ?? 0,
          baseMMR: info?.["base_mmr"] ?? 0,
          baseIMR: info?.["base_imr"] ?? 0,
          IMRFactor: accountInfo.imr_factor[item.symbol] as number,
          referencePrice: item.mark_price,
          leverage: item.leverage ?? 0,
        });
      } else {
        est_liq_price = positions.liqPrice({
          symbol: item.symbol,
          markPrice: item.mark_price,
          totalCollateral: totalCollateral,
          positionQty: item.position_qty,
          positions: rows,
          MMR: item.mmr,
          baseMMR: info?.["base_mmr"],
          baseIMR: info?.["base_imr"],
          IMRFactor: accountInfo.imr_factor[item.symbol] as number,
          costPosition: item.cost_position,
        });
      }
      return {
        ...item,
        est_liq_price,
      };
    });

    if (totalValue !== null && !totalValue.eq(zero)) {
      totalUnrealizedROI = account.totalUnrealizedROI({
        totalUnrealizedPnL: totalUnrealPnl,
        totalValue: totalValue.toNumber(),
      });
      totalUnrealizedROI_index = account.totalUnrealizedROI({
        totalUnrealizedPnL: totalUnrealPnl_index,
        totalValue: totalValue.toNumber(),
      });
    }
  }

  return {
    ...data,

    unrealPnL: totalUnrealPnl,
    total_unreal_pnl: totalUnrealPnl,
    total_unreal_pnl_index: totalUnrealPnl_index,
    notional: notional_total.toNumber(),

    unsettledPnL: unsettlementPnL,
    total_unsettled_pnl: unsettlementPnL,
    unrealPnlROI: totalUnrealizedROI,
    unrealPnlROI_index: totalUnrealizedROI_index,
    total_unsettled_cross_pnl: totalUnsettledCrossPnl.toNumber(),
    total_unsettled_isolated_pnl: totalUnsettledIsolatedPnl.toNumber(),
    rows,
  };
}
