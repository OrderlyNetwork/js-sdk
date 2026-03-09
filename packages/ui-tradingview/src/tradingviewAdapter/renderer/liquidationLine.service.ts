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

const FALLBACK_MS = 3000;

/**
 * Maintains a single horizontal liquidation price line on the chart.
 * Shows estimated liq. price when valid; falls back to position liq. price after 3s or when estimated becomes invalid.
 * Color comes from ColorConfig.liqLineColor (e.g. --oui-color-warning-light); no hardcoded colors.
 */
export class LiquidationLineService {
  private instance: IChartingLibraryWidget;
  private broker: ReturnType<typeof useBroker>;
  private line: IOrderLineAdapter | null = null;
  private fallbackTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.clearFallbackTimer();

    const hasValidEst =
      estimatedLiqPrice != null && Number.isFinite(estimatedLiqPrice);
    const hasValidPosition =
      positionLiqPrice != null && Number.isFinite(positionLiqPrice);

    if (hasValidEst) {
      this.setLinePrice(estimatedLiqPrice!);
      this.startFallbackTimer(positionLiqPrice);
      return;
    }

    if (hasValidPosition) {
      this.setLinePrice(positionLiqPrice!);
      return;
    }

    this.removeLine();
  }

  /** Clear timer and remove the line (e.g. on destroy). */
  remove(): void {
    this.clearFallbackTimer();
    this.removeLine();
  }

  private clearFallbackTimer(): void {
    if (this.fallbackTimer != null) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  private startFallbackTimer(positionLiqPrice: number | null): void {
    this.clearFallbackTimer();
    this.fallbackTimer = setTimeout(() => {
      this.fallbackTimer = null;
      if (positionLiqPrice != null && Number.isFinite(positionLiqPrice)) {
        this.setLinePrice(positionLiqPrice);
      }
    }, FALLBACK_MS);
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
        .setEditable(false)
        .setExtendLeft(true)
        .setTooltip(i18n.t("orderEntry.estLiqPrice"))
        .setText(i18n.t("orderEntry.estLiqPrice"))
        .setQuantity("")
        .setLineStyle(1)
        .setLineColor(lineColor);

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
    }
  }

  private removeLine(): void {
    if (this.line) {
      this.line.remove();
      this.line = null;
    }
  }
}
