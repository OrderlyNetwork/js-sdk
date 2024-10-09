import { API } from "@orderly.network/types";

import { Calculator, CalculatorCtx, CalculatorScope } from "../../types";

import { account, positions } from "@orderly.network/perp";

import { usePositionStore } from "../usePositionStream/usePositionStore";
import { BaseCalculator } from "./baseCalculator";
import { propOr } from "ramda";
import { zero } from "@orderly.network/utils";

class PositionCalculator extends BaseCalculator<API.PositionInfo> {
  name = "positionCalculator";

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
      usePositionStore.getState().actions.setPositions(data);
    }
  }

  private calcByPrice(markPrice: Record<string, number>, ctx: CalculatorCtx) {
    // console.log("!!!! calcByPrice", price, ctx.positions);

    let positions =
      ctx.get((output: Record<string, any>) => output[this.name]) ||
      usePositionStore.getState().positions;

    if (!positions) {
      return null;
    }

    positions = {
      ...positions,
      rows: positions.rows.map((item: API.PositionTPSLExt) => ({
        ...item,
        mark_price: markPrice[item.symbol],
      })),
    };

    const formattedPositions = this.format(positions, ctx);

    return formattedPositions;
  }

  private calcByPosition(positions: API.PositionInfo, ctx: CalculatorCtx) {
    return this.format(positions, ctx);
  }

  private format(
    data: API.PositionInfo | API.PositionsTPSLExt,
    ctx: CalculatorCtx
  ): API.PositionsTPSLExt {
    const { accountInfo, symbolsInfo, fundingRates } = ctx;

    if (!accountInfo || !fundingRates) {
      return data as API.PositionsTPSLExt;
    }

    let unrealPnL_total = zero,
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

      unrealPnL_total = unrealPnL_total.add(unrealPnl);
      notional_total = notional_total.add(notional);
      unsettlementPnL_total = unsettlementPnL_total.add(unsettlementPnL);

      return {
        ...item,
        mm: 0,
        notional,
        unsettlement_pnl: unsettlementPnL,
        unrealized_pnl: unrealPnl,
        unrealized_pnl_ROI: unrealPnlROI,
      };
    });

    return {
      ...data,
      total_unreal_pnl: unrealPnL_total.toNumber(),
      notional: notional_total.toNumber(),
      total_unsettled_pnl: unsettlementPnL_total.toNumber(),
      rows,
    };
  }

  private preprocess(data: API.PositionInfo): API.PositionInfo {
    // console.log("!!!! PositionCalculator preprocess", data);
    return {
      ...data,
      rows: data.rows.filter((item) => item.position_qty !== 0),
    };
  }
}

// const usePositionCalculator = () => new PositionCalculator();

export { PositionCalculator };