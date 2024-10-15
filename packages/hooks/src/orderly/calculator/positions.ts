import { API } from "@orderly.network/types";

import { CalculatorCtx, CalculatorScope } from "../../types";

import { account, positions } from "@orderly.network/perp";

import { usePositionStore } from "../usePositionStream/usePositionStore";
import { BaseCalculator } from "./baseCalculator";
import { propOr } from "ramda";
import { zero } from "@orderly.network/utils";
import { parseHolding } from "../../utils/parseHolding";
import { markets } from "storybook2/src/constants/mockdata";

const NAME_PREFIX = "positionCalculator";
const AllPositions = "all";

class PositionCalculator extends BaseCalculator<API.PositionInfo> {
  // name = "positionCalculator";
  name: string;
  // private id!: string;

  // private state;
  private symbol: string;

  // private id: string;

  constructor(symbol: string = AllPositions) {
    super();

    this.name = `${NAME_PREFIX}_${symbol}`;

    this.symbol = symbol;
  }

  calc(
    scope: CalculatorScope,
    data: any,
    ctx: CalculatorCtx
  ): API.PositionsTPSLExt | null {
    if (scope === CalculatorScope.MARK_PRICE) {
      return this.calcByPrice(data as Record<string, number>, ctx);
    }

    if (scope === CalculatorScope.POSITION) {
      return this.calcByPosition(
        this.preprocess(data as API.PositionInfo),
        ctx
      );
    }

    return data;
  }

  update(data: API.PositionsTPSLExt | null) {
    if (!!data) {
      usePositionStore.getState().actions.setPositions(this.symbol, data);
    }
  }

  private calcByPrice(markPrice: Record<string, number>, ctx: CalculatorCtx) {
    let positions =
      ctx.get((output: Record<string, any>) => output[this.name]) ||
      usePositionStore.getState().positions[this.symbol];

    if (!positions) {
      return null;
    }

    if (!Array.isArray(positions.rows) || !positions.rows.length)
      return positions;

    positions = {
      ...positions,
      rows: positions.rows.map((item: API.PositionTPSLExt) => ({
        ...item,
        mark_price: markPrice[item.symbol],
      })),
    };

    return this.format(positions, ctx);
  }

  private calcByPosition(positions: API.PositionInfo, ctx: CalculatorCtx) {
    return this.format(positions, ctx);
  }

  private format(
    data: API.PositionInfo | API.PositionsTPSLExt,
    ctx: CalculatorCtx
  ): API.PositionsTPSLExt {
    const { accountInfo, symbolsInfo, fundingRates, portfolio } = ctx;

    if (!accountInfo || !fundingRates) {
      return data as API.PositionsTPSLExt;
    }

    let unrealPnL_total = zero,
      notional_total = zero,
      unsettlementPnL_total = zero;

    let rows = data.rows.map((item) => {
      const info = symbolsInfo[item.symbol];

      const notional = positions.notional(item.position_qty, item.mark_price);
      const unrealPnl = positions.unrealizedPnL({
        qty: item.position_qty,
        openPrice: item?.average_open_price,
        // markPrice: unRealizedPrice,
        markPrice: item.mark_price,
      });

      const imr = account.IMR({
        maxLeverage: accountInfo.max_leverage,
        baseIMR: info["base_imr"],
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

      const unsettlementPnL = positions.unsettlementPnL({
        positionQty: item.position_qty,
        markPrice: item.mark_price,
        costPosition: item.cost_position,
        sumUnitaryFunding: propOr(
          0,
          "sum_unitary_funding",
          fundingRates[item.symbol]
        ),
        lastSumUnitaryFunding: item.last_sum_unitary_funding,
      });

      const MMR = positions.MMR({
        baseMMR: info["base_mmr"],
        baseIMR: info["base_imr"],
        IMRFactor: accountInfo.imr_factor[item.symbol] as number,
        positionNotional: notional,
        IMR_factor_power: 4 / 5,
      });

      unrealPnL_total = unrealPnL_total.add(unrealPnl);
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
        unrealized_pnl_ROI: unrealPnlROI,
      };
    });

    const unrealPnl = unrealPnL_total.toNumber();
    const unsettlementPnL = unsettlementPnL_total.toNumber();
    let totalUnrealizedROI = 0;

    if (portfolio) {
      const { totalValue, totalCollateral } = portfolio;

      rows = rows.map((item) => {
        const est_liq_price = positions.liqPrice({
          markPrice: item.mark_price,
          totalCollateral: totalCollateral.toNumber(),
          positionQty: item.position_qty,
          positions: rows,
          MMR: item.mmr,
        });
        return {
          ...item,
          est_liq_price,
        };
      });

      if (!totalValue.eq(zero)) {
        totalUnrealizedROI = account.totalUnrealizedROI({
          totalUnrealizedPnL: unrealPnl,
          totalValue: totalValue.toNumber(),
        });
      }
    }

    return {
      ...data,

      unrealPnL: unrealPnl,
      total_unreal_pnl: unrealPnl,
      notional: notional_total.toNumber(),

      unsettledPnL: unsettlementPnL,
      total_unsettled_pnl: unsettlementPnL,
      unrealPnlROI: totalUnrealizedROI,
      rows,
    };
  }

  private preprocess(data: API.PositionInfo): API.PositionInfo {
    // console.log("!!!! PositionCalculator preprocess", data);
    // let rows = data.rows.filter((item) => item.position_qty !== 0);
    let rows = data.rows;
    if (this.symbol !== AllPositions) {
      rows = rows.filter((item: API.Position) => item.symbol === this.symbol);
    }
    return {
      ...data,
      rows,
    };
  }
}

// const usePositionCalculator = () => new PositionCalculator();

export { PositionCalculator };
