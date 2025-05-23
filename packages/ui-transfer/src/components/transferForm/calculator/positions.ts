import { propOr } from "ramda";
import { SymbolInfo } from "@orderly.network/hooks";
import { account, positions } from "@orderly.network/perp";
import { API } from "@orderly.network/types";
import { zero } from "@orderly.network/utils";

type EmptyPosition = Omit<API.PositionsTPSLExt, "rows"> & {
  rows: API.PositionsTPSLExt["rows"] | null;
};

export const POSITION_EMPTY: EmptyPosition = {
  rows: [],
  margin_ratio: 0,
  initial_margin_ratio: 0,
  maintenance_margin_ratio: 0,
  open_margin_ratio: 0,
  current_margin_ratio_with_orders: 0,
  initial_margin_ratio_with_orders: 0,
  maintenance_margin_ratio_with_orders: 0,
  total_collateral_value: 0,
  free_collateral: 0,
  total_pnl_24_h: 0,
  unrealPnL: 0,
  total_unreal_pnl: 0,
  unsettledPnL: 0,
  total_unsettled_pnl: 0,
  notional: 0,
  unrealPnlROI: 0,
};

export function formatPositions(
  data: API.PositionInfo | API.PositionsTPSLExt,
  accountInfo?: API.AccountInfo,
  symbolsInfo?: SymbolInfo,
  fundingRates?: Record<string, API.FundingRate>,
  // portfolio?: Portfolio,
): API.PositionsTPSLExt {
  if (!accountInfo || !fundingRates || !symbolsInfo) {
    return data as API.PositionsTPSLExt;
  }

  let unrealPnL_total = zero,
    unrealPnL_total_index = zero,
    notional_total = zero,
    unsettlementPnL_total = zero;

  const rows = data.rows.map((item) => {
    const info = symbolsInfo[item.symbol];

    const notional = positions.notional(item.position_qty, item.mark_price);
    const unrealPnl = positions.unrealizedPnL({
      qty: item.position_qty,
      openPrice: item?.average_open_price,
      // markPrice: unRealizedPrice,
      markPrice: item.mark_price,
    });
    let unrealPnl_index = 0,
      unrealPnlROI_index = 0;

    const imr = account.IMR({
      maxLeverage: accountInfo.max_leverage,
      baseIMR: info?.("base_imr"),
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

    const unsettlementPnL = positions.unsettlementPnL({
      positionQty: item.position_qty,
      markPrice: item.mark_price,
      costPosition: item.cost_position,
      sumUnitaryFunding: propOr(
        0,
        "sum_unitary_funding",
        fundingRates?.[item.symbol],
      ),
      lastSumUnitaryFunding: item.last_sum_unitary_funding,
    });

    const MMR = positions.MMR({
      baseMMR: info?.("base_mmr"),
      baseIMR: info?.("base_imr"),
      IMRFactor: accountInfo.imr_factor[item.symbol] as number,
      positionNotional: notional,
      IMR_factor_power: 4 / 5,
    });

    unrealPnL_total = unrealPnL_total.add(unrealPnl);
    unrealPnL_total_index = unrealPnL_total_index.add(unrealPnl_index);
    notional_total = notional_total.add(notional);
    unsettlementPnL_total = unsettlementPnL_total.add(unsettlementPnL);

    return {
      ...item,
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
    };
  });

  const totalUnrealPnl = unrealPnL_total.toNumber();
  const totalUnrealPnl_index = unrealPnL_total_index.toNumber();
  const unsettlementPnL = unsettlementPnL_total.toNumber();

  // not used data
  // let totalUnrealizedROI = 0,
  //   totalUnrealizedROI_index = 0;

  // if (portfolio) {
  //   const { totalValue, totalCollateral } = portfolio;

  //   rows = rows.map((item) => {
  //     const est_liq_price = positions.liqPrice({
  //       markPrice: item.mark_price,
  //       totalCollateral: totalCollateral.toNumber(),
  //       positionQty: item.position_qty,
  //       positions: rows,
  //       MMR: item.mmr,
  //     });
  //     return {
  //       ...item,
  //       est_liq_price,
  //     };
  //   });

  //   if (totalValue !== null && !totalValue.eq(zero)) {
  //     totalUnrealizedROI = account.totalUnrealizedROI({
  //       totalUnrealizedPnL: totalUnrealPnl,
  //       totalValue: totalValue.toNumber(),
  //     });
  //     totalUnrealizedROI_index = account.totalUnrealizedROI({
  //       totalUnrealizedPnL: totalUnrealPnl_index,
  //       totalValue: totalValue.toNumber(),
  //     });
  //   }
  // }

  return {
    ...data,

    unrealPnL: totalUnrealPnl,
    total_unreal_pnl: totalUnrealPnl,
    total_unreal_pnl_index: totalUnrealPnl_index,
    notional: notional_total.toNumber(),

    unsettledPnL: unsettlementPnL,
    total_unsettled_pnl: unsettlementPnL,
    // unrealPnlROI: totalUnrealizedROI,
    // unrealPnlROI_index: totalUnrealizedROI_index,
    rows,
  };
}

export function calcByPrice(
  positions?: API.PositionInfo,
  markPrice?: Record<string, number>,
  indexPrice?: Record<string, number>,
) {
  if (!positions || !Array.isArray(positions.rows) || !positions.rows.length) {
    return positions;
  }

  return {
    ...positions,
    rows: positions.rows.map((item) => ({
      ...item,
      mark_price: markPrice?.[item.symbol] || item.mark_price,
      index_price:
        indexPrice?.[item.symbol] || item.index_price || item.mark_price,
    })),
  };
}

// function calcByMarkPrice(
//   positions: API.PositionsTPSLExt,
//   markPrice: Record<string, number>,
// ) {
//   if (!positions || !Array.isArray(positions.rows) || !positions.rows.length) {
//     return positions;
//   }

//   positions = {
//     ...positions,
//     rows: positions.rows.map((item: API.PositionTPSLExt) => ({
//       ...item,
//       mark_price: markPrice[item.symbol] || item.mark_price,
//     })),
//   };

//   return positions;
// }

// function calcByIndexPrice(
//   positions: API.PositionsTPSLExt,
//   indexPrice: Record<string, number>,
// ) {
//   if (!positions || !Array.isArray(positions.rows) || !positions.rows.length) {
//     return positions;
//   }

//   positions = {
//     ...positions,
//     rows: positions.rows.map((item: API.PositionTPSLExt) => ({
//       ...item,
//       index_price:
//         indexPrice[item.symbol] || item.index_price || item.mark_price,
//     })),
//   };

//   return positions;
// }
