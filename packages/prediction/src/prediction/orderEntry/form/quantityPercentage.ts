import { Decimal } from "@orderly.network/utils";

/** Quantity corresponding to a percentage of an available balance. */
export function quantityFromPercentage(
  available: number,
  percentage: number,
  dp = 4,
): string {
  if (!(available > 0) || !(percentage > 0)) return "";
  if (percentage >= 100) return String(available);
  return new Decimal(available)
    .mul(percentage)
    .div(100)
    .toFixed(dp, Decimal.ROUND_DOWN);
}

/** Percentage of available represented by a quantity (0–100). */
export function percentageFromQuantity(
  quantity: number,
  available: number,
): number {
  if (!(available > 0)) return 0;
  return Math.max(
    0,
    Math.min(
      100,
      new Decimal(quantity || 0).div(available).mul(100).toNumber(),
    ),
  );
}

/** Amount string for a percentage of a max (order-entry amount field). */
export function amountFromPercentage(
  maxAmount: number,
  percentage: number,
  dp: number,
): string {
  if (!(maxAmount > 0) || !(percentage > 0)) return "";
  const next = new Decimal(maxAmount)
    .mul(Math.min(Math.max(percentage, 0), 100))
    .div(100)
    .toDecimalPlaces(dp, Decimal.ROUND_DOWN);
  return next.gt(0) ? next.toFixed(dp) : "";
}
