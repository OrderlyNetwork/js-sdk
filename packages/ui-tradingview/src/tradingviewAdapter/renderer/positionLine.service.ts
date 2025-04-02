import {
  IChartingLibraryWidget,
  IOrderLineAdapter,
  IPositionLineAdapter,
} from "../charting_library";
import useBroker from "../hooks/useBroker";
import { ChartMode, ChartPosition } from "../type";
import { Decimal, commify } from "@orderly.network/utils";
import { i18n } from "@orderly.network/i18n";

export class PositionLineService {
  private instance: IChartingLibraryWidget;
  private positionLines: Record<number, IPositionLineAdapter>;
  private currentSymbol: string;
  private broker: ReturnType<typeof useBroker>;
  private lastPositions: ChartPosition[] | null;

  constructor(
    instance: IChartingLibraryWidget,
    broker: ReturnType<typeof useBroker>
  ) {
    this.instance = instance;
    this.currentSymbol = "";
    this.broker = broker;
    this.positionLines = {};
    this.lastPositions = null;
  }

  renderPositions(positions: ChartPosition[] | null) {
    if (positions === null || positions.length === 0) {
      this.removePositions();
      return;
    }

    if (this.lastPositions?.length !== positions.length) {
      this.removePositions();
    }

    if (positions[0].symbol !== this.currentSymbol) {
      this.removePositions();
      this.currentSymbol = positions[0].symbol;
    }

    positions.forEach((position, idx) => this.drawPositionLine(position, idx));
    this.lastPositions = positions;
  }

  getBasePositionLine() {
    return this.instance
      .activeChart()
      .createPositionLine()
      .setTooltip("Close Position")
      .setQuantityBackgroundColor(this.broker.colorConfig.chartBG!)
      .setCloseButtonBackgroundColor(this.broker.colorConfig.chartBG!)
      .setBodyTextColor(this.broker.colorConfig.textColor!)
      .setQuantityTextColor(this.broker.colorConfig.qtyTextColor!)
      .setBodyFont(this.broker.colorConfig.font!)
      .setQuantityFont(this.broker.colorConfig.font!)
      .setLineLength(100)
      .setLineStyle(1);
  }

  static getPositionQuantity(balance: number) {
    return commify(new Decimal(balance).todp(4, Decimal.ROUND_DOWN).toString());
  }

  static getPositionPnL(unrealPnl: number, decimal: number) {
    let text = i18n.t("tpsl.pnl");
    const pnl = new Decimal(unrealPnl).toFixed(decimal, Decimal.ROUND_DOWN);
    if (new Decimal(unrealPnl).eq(0)) {
      return `${text} 0`;
    }
    if (new Decimal(unrealPnl).greaterThan(0)) {
      return `${text} +${commify(pnl)}`;
    }
    return `${text} ${commify(pnl)}`;
  }

  removePositions() {
    Object.keys(this.positionLines).forEach((lineId) => {
      this.positionLines[Number(lineId)].remove();
      delete this.positionLines[Number(lineId)];
    });
  }

  drawPositionLine(position: ChartPosition, idx: number) {
    const colorConfig = this.broker.colorConfig;
    const isPositiveUnrealPnl = position.unrealPnl >= 0;
    const isPositiveBalance = position.balance >= 0;

    let pnlColor = colorConfig.pnlZoreColor;
    const pnlDecimal = new Decimal(position.unrealPnl);
    if (pnlDecimal.greaterThan(0)) {
      pnlColor = colorConfig.upColor;
    } else if (pnlDecimal.lessThan(0)) {
      pnlColor = colorConfig.downColor;
    }
    const borderColor = isPositiveUnrealPnl
      ? colorConfig.pnlUpColor
      : colorConfig.pnlDownColor;
    const sideColor = isPositiveBalance
      ? colorConfig.upColor
      : colorConfig.downColor;
    const price = new Decimal(position.open).toNumber();

    this.positionLines[idx] =
      this.positionLines[idx] ?? this.getBasePositionLine();
    this.positionLines[idx]
      .setQuantity(PositionLineService.getPositionQuantity(position.balance))
      .setPrice(price)
      .setCloseButtonIconColor(colorConfig.closeIcon!)
      .setCloseButtonBorderColor(sideColor!)
      .setBodyBackgroundColor(pnlColor!)
      .setQuantityTextColor(sideColor!)
      .setBodyBorderColor(pnlColor!)
      .setLineColor(sideColor!)
      .setQuantityBorderColor(sideColor!)
      .setText(
        PositionLineService.getPositionPnL(
          position.unrealPnl,
          position.unrealPnlDecimal
        )
      );

    if (this.broker.mode !== ChartMode.MOBILE) {
      this.positionLines[idx].onClose(null, () => {
        this.broker.closePosition(position);
      });
    }
  }
}
