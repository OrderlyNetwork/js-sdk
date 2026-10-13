import { Decimal } from "@orderly.network/utils";

/** Keep small nonzero chart changes readable without rounding them to zero. */
export function formatChartPriceDifferencePercent(
  percent: number | null | undefined,
): string {
  if (percent == null || !Number.isFinite(percent)) return "--";
  if (percent === 0) return "0.00%";

  const magnitude = new Decimal(percent).abs();
  const sign = percent > 0 ? "+" : "−";
  if (magnitude.gte(0.01)) {
    return `${sign}${magnitude.toFixed(2, Decimal.ROUND_DOWN)}%`;
  }

  const rounded = magnitude.toSignificantDigits(2, Decimal.ROUND_HALF_UP);
  const decimalPlaces = 1 - rounded.exponent();
  const value =
    decimalPlaces > 8
      ? rounded.toExponential(1)
      : rounded.toFixed(decimalPlaces);
  return `${sign}${value}%`;
}
