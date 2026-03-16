import { i18n } from "@orderly.network/i18n";
import { IChartingLibraryWidget, IOrderLineAdapter } from "../charting_library";
import useBroker from "../hooks/useBroker";

/** Params for rendering the single shared liquidation price line (position vs estimated). */
export interface LiquidationLineRenderParams {
  /** Position liquidation price (from current symbol position); null when no position. */
  positionLiqPrice: number | null;
  /** Order Entry estimated liquidation price; null when invalid or "--". */
  estimatedLiqPrice: number | null;
}

/**
 * Maintains a single horizontal liquidation price line on the chart.
 * Shows estimated liq. price when valid; otherwise position liq. price. No internal fallback timer
 * so the line stays in sync with OrderEntry (hook controls when to clear estimated).
 */
export class LiquidationLineService {
  private instance: IChartingLibraryWidget;
  private broker: ReturnType<typeof useBroker>;
  private line: IOrderLineAdapter | null = null;
  /** Tracks whether the current line source is estimated liq. price (vs position liq. price). */
  private isUsingEstimatedPrice: boolean = false;

  constructor(
    instance: IChartingLibraryWidget,
    broker: ReturnType<typeof useBroker>,
  ) {
    this.instance = instance;
    this.broker = broker;
  }

  /**
   * Render or update the liquidation line. Call when position or estimated liq. price changes.
   */
  renderLiquidationLine(params: LiquidationLineRenderParams): void {
    const { positionLiqPrice, estimatedLiqPrice } = params;

    const hasValidEst =
      estimatedLiqPrice != null && Number.isFinite(estimatedLiqPrice);
    const hasValidPosition =
      positionLiqPrice != null && Number.isFinite(positionLiqPrice);

    if (hasValidEst) {
      this.isUsingEstimatedPrice = true;
      this.setLinePrice(estimatedLiqPrice!);
      this.line?.setLineStyle(1);
      return;
    }

    if (hasValidPosition) {
      this.isUsingEstimatedPrice = false;
      this.setLinePrice(positionLiqPrice!);
      this.line?.setLineStyle(0);
      return;
    }

    this.removeLine();
  }

  /** Remove the line (e.g. on destroy). */
  remove(): void {
    this.removeLine();
  }

  private getOrCreateLine(): IOrderLineAdapter | null {
    if (this.line != null) {
      return this.line;
    }
    try {
      const activeChart = this.instance.activeChart();
      if (!activeChart) return null;

      const orderLine = activeChart.createOrderLine();
      if (!orderLine) return null;

      const colorConfig = this.broker.colorConfig;
      /** Use liqLineColor from CSS var (--oui-color-warning-light); do not hardcode. */
      const lineColor = colorConfig.liqLineColor ?? colorConfig.textColor;
      if (!lineColor) return null;

      this.line = orderLine
        .setCancellable(false)
        .setLineLength(100)
        .setEditable(false)
        .setExtendLeft(true)
        .setQuantity("")
        .setLineStyle(1)
        .setLineColor(lineColor)
        .setBodyBorderColor(lineColor);

      this.updateLineLabel();

      if (colorConfig.chartBG) {
        this.line = this.line
          .setBodyBackgroundColor(colorConfig.chartBG)
          .setQuantityBackgroundColor(colorConfig.chartBG);
      }
      if (colorConfig.textColor) {
        this.line = this.line.setBodyTextColor(colorConfig.textColor);
      }
      if (colorConfig.font) {
        this.line = this.line
          .setBodyFont(colorConfig.font)
          .setQuantityFont(colorConfig.font);
      }
      return this.line;
    } catch {
      return null;
    }
  }

  private setLinePrice(price: number): void {
    const line = this.getOrCreateLine();
    if (line) {
      line.setPrice(price);
      this.updateLineLabel();
    }
  }

  private removeLine(): void {
    if (this.line) {
      this.line.remove();
      this.line = null;
    }
  }

  /** Ensure tooltip/text reflect whether we are showing estimated or position liq. price. */
  private updateLineLabel(): void {
    if (!this.line) return;
    const key = this.isUsingEstimatedPrice
      ? "orderEntry.estLiqPrice"
      : "positions.column.liqPrice";
    const label = i18n.t(key);
    this.line.setTooltip(label).setText(label);
  }
}
