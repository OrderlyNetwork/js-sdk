import { API } from "@orderly.network/types";
import { useApiStatusStore } from "../../next/apiStatus/apiStatus.store";
import { CalculatorCtx, CalculatorScope } from "../../types";
import { useAppStore } from "../appStore";
import { usePositionStore } from "../usePositionStream/usePosition.store";
import { BaseCalculator } from "./baseCalculator";
import { CalculatorContext } from "./calculatorContext";
import { formatPositions } from "./formatPositions";

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
    ctx: CalculatorCtx,
  ): API.PositionsTPSLExt | null {
    if (scope === CalculatorScope.MARK_PRICE) {
      return this.calcByMarkPrice(data as Record<string, number>, ctx);
    }

    if (scope === CalculatorScope.INDEX_PRICE) {
      return this.calcByIndexPrice(data, ctx);
    }

    if (scope === CalculatorScope.POSITION) {
      return this.calcByPosition(
        this.preprocess(data as API.PositionInfo),
        ctx,
      );
    }

    return data;
  }

  update(data: API.PositionsTPSLExt | null, scope: CalculatorScope) {
    // if (this.symbol !== AllPositions) {
    //   console.log("PositionCalculator update", scope, this.name, data);
    // }
    if (!data || !Array.isArray(data.rows)) return;

    usePositionStore.getState().actions.setPositions(this.symbol, data);

    /// update position loading status
    if (
      Array.isArray(data.rows) &&
      useApiStatusStore.getState().apis.positions.loading
    ) {
      useApiStatusStore.getState().actions.updateApiLoading("positions", false);
    }
  }

  private calcByMarkPrice(
    markPrice: Record<string, number>,
    ctx: CalculatorCtx,
  ) {
    let positions = this.getPosition(markPrice, ctx);
    const fundingRates = useAppStore.getState().fundingRates;

    // positions = this.checkIsClosed(positions, ctx);

    // console.log("-------PositionCalculator calcByMarkPrice", positions);

    if (!positions || !Array.isArray(positions.rows) || !positions.rows.length)
      return positions;

    positions = {
      ...positions,
      rows: positions.rows.map((item: API.PositionTPSLExt) => {
        // console.log(fundingRates?.[item.symbol]);

        return {
          ...item,

          mark_price: markPrice[item.symbol] ?? item.mark_price,
        };
      }),
    };

    return this.format(positions, ctx);
  }

  private calcByIndexPrice(
    indexPrice: Record<string, number>,
    ctx: CalculatorCtx,
  ) {
    let positions = this.getPosition(indexPrice, ctx);
    // positions = this.checkIsClosed(positions, ctx);

    if (!positions) {
      return positions;
    }

    if (!Array.isArray(positions.rows) || !positions.rows.length)
      return positions;

    positions = {
      ...positions,
      rows: positions.rows.map((item: API.PositionTPSLExt) => ({
        ...item,
        index_price:
          indexPrice[item.symbol] || item.index_price || item.mark_price,
      })),
    };

    return this.format(positions, ctx);
  }

  private calcByPosition(positions: API.PositionInfo, ctx: CalculatorCtx) {
    if (positions.rows.length === 0) return positions as API.PositionsTPSLExt;

    // need to clear the position if the position has been closed
    return this.format(positions, ctx);
  }

  private format(
    data: API.PositionInfo | API.PositionsTPSLExt,
    ctx: CalculatorCtx,
  ): API.PositionsTPSLExt {
    return formatPositions(data, ctx);
  }

  private preprocess(data: API.PositionInfo): API.PositionInfo {
    let rows = data.rows;
    if (this.symbol !== AllPositions && Array.isArray(rows)) {
      rows = rows.filter((item: API.Position) => item.symbol === this.symbol);
    }
    return {
      ...data,
      rows,
    };
  }

  private getPosition(_: Record<string, number>, ctx: CalculatorCtx) {
    const positions =
      ctx.get((output: Record<string, any>) => output[this.name]) ||
      usePositionStore.getState().positions[this.symbol];

    if (this.symbol === AllPositions) {
      return positions;
    }

    if (positions && Array.isArray(positions.rows)) {
      return positions;
    }

    return this.preprocess(this.getAllPositions(ctx) as API.PositionInfo);
  }

  destroy() {
    usePositionStore.getState().actions.closePosition(this.symbol);
    CalculatorContext.instance?.deleteByName(this.name);
  }

  private getAllPositions(ctx: CalculatorCtx) {
    return (
      ctx.get((output: Record<string, any>) => output[AllPositions]) ||
      usePositionStore.getState().positions[AllPositions]
    );
  }

  static logPosition = (symbol = "all") => {
    return usePositionStore.getState().positions[symbol];
  };
}

// const usePositionCalculator = () => new PositionCalculator();

export { PositionCalculator };
