import { API } from "@orderly.network/types";

import { Calculator, CalculatorCtx, CalculatorScope } from "../../types";

import { account, positions } from "@orderly.network/perp";

import {
  usePositionActions,
  usePositions,
  usePositionStore,
} from "../usePositionStream/usePositionStore";
import { BaseCalculator } from "./baseCalculator";
import { useMarkPriceStore } from "../useMarkPrice/useMarkPriceStore";
import { propOr } from "ramda";

class PositionCalculator extends BaseCalculator<API.PositionTPSLExt[]> {
  name = "positionCalculator";
  calc(
    scope: CalculatorScope,
    data: any,
    ctx: CalculatorCtx
  ): API.PositionExt[] {
    console.log("!!!! PositionCalculator calc", scope, ctx.positions);
    if (scope === CalculatorScope.MARK_PRICE) {
      return this.calcByPrice(data as Record<string, number>, ctx);
    }

    if (scope === CalculatorScope.POSITION) {
      return this.calcByPosition(this.preprocess(data), ctx);
    }

    return [];
  }

  update(data: API.PositionTPSLExt[]) {
    // console.log("!!!! Updating positions...", data);
    // const { updatePosition } = usePositionActions();

    // updatePosition(data);
    usePositionStore.getState().actions.setPositions(data);
  }

  private calcByPrice(price: Record<string, number>, ctx: CalculatorCtx) {
    return [];
  }
  private calcByPosition(positions: API.Position[], ctx: CalculatorCtx) {
    return this.format(positions, ctx);
  }

  private format(
    data: (API.PositionTPSLExt | API.PositionExt | API.Position)[],
    ctx: CalculatorCtx
  ): API.PositionExt[] {
    const { accountInfo, symbolsInfo, fundingRates } = ctx;

    if (!accountInfo || !fundingRates) {
      return data as API.PositionExt[];
    }

    return data.map((item) => {
      //TODO: get markPrice from store
      // const markPrice = useMarkPriceStore.getState().markPrices[item.symbol];
      // // console.log("!!!! ctx", ctx);
      // console.log("!!!! markPrice", markPrice);
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

      console.log(
        "!!!! unrealPnlROI",
        unrealPnlROI,
        unrealPnl,
        unsettlementPnL
      );

      return {
        ...item,
        // mark_price: item.mark_price,
        mm: 0,
        notional,
        unsettlement_pnl: unsettlementPnL,
        unrealized_pnl: unrealPnl,
        unrealized_pnl_ROI: unrealPnlROI,
      };
      // const imr = account.IMR({
      //   maxLeverage: accountInfo.max_leverage,
      //   baseIMR: info("base_imr"),
      //   IMR_Factor: accountInfo.imr_factor[item.symbol] as number,
      //   positionNotional: notional,
      //   ordersNotional: 0,
      //   IMR_factor_power: 4 / 5,
      // });
    });
  }

  private preprocess(data: API.Position[]) {
    return data.filter((item) => item.position_qty !== 0);
  }
}

// const usePositionCalculator = () => new PositionCalculator();

export { PositionCalculator };
